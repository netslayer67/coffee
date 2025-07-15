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

// Async Thunk untuk membuat pesanan baru (tetap ada, tapi akan dipanggil secara internal)
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
        let currentOrder = orders.currentOrder;

        // Langkah 1: Jika belum ada pesanan aktif, buat "draft" pesanan baru.
        if (!currentOrder) {
            const { customerName, tableId } = customer.session;
            if (!customerName || !tableId) {
                return rejectWithValue('Sesi pelanggan tidak valid. Silakan mulai dari awal.');
            }

            const orderData = {
                customerName,
                table: tableId,
                items: [{ product: item._id, quantity: 1, price: item.price }],
                subtotal: item.price,
                total: item.price,
            };

            try {
                const actionResult = await dispatch(createOrder(orderData));
                if (createOrder.rejected.match(actionResult)) {
                    return rejectWithValue(actionResult.payload);
                }
                // `currentOrder` akan diisi oleh extraReducer dari createOrder
            } catch (err) {
                return rejectWithValue(err.message);
            }
        }

        // Langkah 2: Setelah memastikan pesanan ada, tambahkan item ke state cart
        dispatch(orderSlice.actions.addToCart(item));
        // Mengembalikan data item agar bisa diakses jika perlu
        return item;
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
            state.orders.unshift(action.payload);
        },
        updateOrderRealtime: (state, action) => {
            const updatedOrder = action.payload;
            const index = state.orders.findIndex(order => order._id === updatedOrder._id);
            if (index !== -1) {
                state.orders[index] = updatedOrder;
            }
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
    updateOrderRealtime
} = orderSlice.actions;

// Ekspor semua selectors yang relevan
export const selectAllOrders = (state) => state.orders.orders;
export const selectCart = (state) => state.orders.cart;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;

export default orderSlice.reducer;