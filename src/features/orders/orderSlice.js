import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios'; // Pastikan path ini benar

// Initial state untuk slice pesanan
const initialState = {
    orders: [], // Untuk menyimpan daftar pesanan dari kasir
    currentOrder: null, // Untuk menyimpan detail pesanan yang sedang dilihat
    cart: [], // Keranjang belanja pelanggan
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

/**
 * Async Thunk untuk MEMBUAT PESANAN BARU
 * Memanggil endpoint: POST /orders
 */
export const createOrder = createAsyncThunk(
    'orders/create',
    async (orderData, { rejectWithValue }) => {
        try {
            // orderData berisi: { customerName, table, items, subtotal, total }
            const response = await axios.post('/orders', orderData);
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
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
    // Reducers sinkron biasa untuk mengelola keranjang belanja (cart)
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
    },
    extraReducers: (builder) => {
        builder
            // Kasus untuk createOrder
            .addCase(createOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload; // Simpan pesanan yang baru dibuat
                state.cart = []; // Kosongkan keranjang setelah berhasil
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Kasus untuk fetchOrders (get all orders for cashier)
            .addCase(fetchOrders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
            })
            // Kasus untuk updateOrderStatus
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const updatedOrder = action.payload;
                const index = state.orders.findIndex(order => order._id === updatedOrder._id);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                }
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

// Ekspor aksi dan reducer
export const { addToCart, updateCartQuantity, clearCart } = orderSlice.actions;

// Ekspor selectors
export const selectAllOrders = (state) => state.orders.orders;
export const selectCart = (state) => state.orders.cart;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;

export default orderSlice.reducer;