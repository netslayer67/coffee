import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios'; // Pastikan path ini benar

// Initial state untuk slice pesanan
const initialState = {
    orderId: null,
    orders: [], // Untuk menyimpan daftar pesanan dari kasir
    currentOrder: null, // Untuk menyimpan detail pesanan yang sedang dilihat
    cart: [], // Keranjang belanja pelanggan
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Thunk untuk membuat pesanan baru
export const createOrder = createAsyncThunk(
    'orders/create',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/orders', orderData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal membuat pesanan.');
        }
    }
);

export const handleAddToCart = createAsyncThunk(
    'orders/handleAddToCart',
    async (item, { getState, dispatch, rejectWithValue }) => {
        const { orders, customer } = getState();
        let activeOrder = orders.currentOrder;

        // Jika belum ada pesanan aktif, buat "draft" pesanan baru.
        if (!activeOrder) {
            const { customerName, tableId } = customer.session;
            if (!customerName || !tableId) {
                return rejectWithValue('Sesi pelanggan tidak valid.');
            }

            const draftOrderData = {
                customerName,
                table: tableId,
                items: [{ product: item._id, quantity: 1, price: item.price }],
                subtotal: item.price,
                total: item.price,
            };

            try {
                const actionResult = await dispatch(createOrder(draftOrderData));
                if (createOrder.rejected.match(actionResult)) {
                    return rejectWithValue(actionResult.payload);
                }
                activeOrder = actionResult.payload; // Tangkap pesanan yang baru dibuat
            } catch (err) {
                return rejectWithValue(err.message);
            }
        }

        // Tambahkan item ke keranjang di state
        dispatch(orderSlice.actions.addToCart(item));

        // Kembalikan pesanan yang aktif agar bisa digunakan oleh komponen
        return activeOrder;
    }
);

/**
 * Async Thunk untuk MENGAMBIL SEMUA PESANAN (untuk kasir)
 * Memanggil endpoint: GET /orders
 */
export const fetchOrders = createAsyncThunk(
    'orders/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token; // Mengambil token dari authSlice
            const response = await axios.get('/orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
);

/**
 * Async Thunk untuk MEMPERBARUI STATUS PESANAN (oleh kasir)
 * Memanggil endpoint: PATCH /orders/:id/status
 */
export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ orderId, status }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.patch(
                `/orders/${orderId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
);

/**
 * Async Thunk untuk MENGAMBIL STATUS PESANAN (untuk pelanggan)
 * Memanggil endpoint: GET /orders/status/:id
 */
export const fetchCustomerOrderStatus = createAsyncThunk(
    'orders/fetchStatus',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/orders/status/${orderId}`);
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
);


const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existingItem = state.cart.find((cartItem) => cartItem._id === item._id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.cart.push({ ...item, quantity: 1 });
            }
        },
        updateCartQuantity: (state, action) => {
            const { itemId, quantity } = action.payload;
            const itemToUpdate = state.cart.find((item) => item._id === itemId);
            if (itemToUpdate) {
                if (quantity <= 0) {
                    state.cart = state.cart.filter((item) => item._id !== itemId);
                } else {
                    itemToUpdate.quantity = quantity;
                }
            }
        },
        clearCart: (state) => {
            state.cart = [];
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        // Reducers untuk fungsionalitas real-time
        addOrderRealtime: (state, action) => {
            const exists = state.orders.some(order => order._id === action.payload._id);
            if (!exists) {
                state.orders.push(action.payload);
            }
        },
        updateOrderRealtime: (state, action) => {
            const updatedOrder = action.payload;

            // Perbarui daftar pesanan untuk kasir
            const index = state.orders.findIndex(order => order._id === updatedOrder._id);
            if (index !== -1) {
                state.orders[index] = updatedOrder;
            }

            // --- TAMBAHKAN LOGIKA INI ---
            // Jika pesanan yang diperbarui adalah pesanan yang sedang dilihat,
            // perbarui juga `currentOrder`.
            if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
                state.currentOrder = updatedOrder;
            }
        },
        addOrdersBatch: (state, action) => {
            const newOrders = action.payload;

            newOrders.forEach(newOrder => {
                const exists = state.orders.some(order => order._id === newOrder._id);
                if (!exists) {
                    state.orders.push(newOrder);
                }
            });
        },

    },
    extraReducers: (builder) => {
        builder
            // Kasus untuk createOrder (dipanggil oleh handleAddToCart)
            .addCase(createOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload; // Simpan pesanan yang baru dibuat
                // JANGAN KOSONGKAN KERANJANG DI SINI, karena item pertama baru masuk
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Kasus untuk handleAddToCart (Thunk utama)
            .addCase(handleAddToCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(handleAddToCart.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(handleAddToCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Kasus untuk updateOrderStatus
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                // Pembaruan state sekarang ditangani oleh `updateOrderRealtime` via socket,
                // jadi kita tidak perlu melakukan apa-apa di sini, cukup ubah status.
                state.status = 'succeeded';
            })
            // Kasus untuk fetchCustomerOrderStatus
            .addCase(fetchCustomerOrderStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCustomerOrderStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
            })
            .addCase(fetchCustomerOrderStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            });
    },
});

// Ekspor semua aksi dan reducer yang relevan
export const {
    addToCart,
    updateCartQuantity,
    clearCart,
    clearCurrentOrder,
    addOrderRealtime,
    updateOrderRealtime,
    addOrdersBatch // <-- Tambahan baru
} = orderSlice.actions;

// Ekspor semua selectors yang relevan
export const selectAllOrders = (state) => state.orders.orders;
export const selectCart = (state) => state.orders.cart;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;

export default orderSlice.reducer;