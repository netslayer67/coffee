import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const cartFromStorage = JSON.parse(localStorage.getItem('cart')) || [];

const initialState = {
    cart: cartFromStorage,
    orders: [],
    currentOrder: null,
    orderId: null,
    status: 'idle',
    error: null,
};

// ✅ Thunk: Buat pesanan
export const createOrder = createAsyncThunk(
    'orders/create',
    async (orderData, { getState, rejectWithValue }) => {
        const { cart } = getState().orders;

        if (cart.length === 0) {
            return rejectWithValue('Keranjang tidak boleh kosong.');
        }

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const formattedItems = cart.map(item => ({
            product: item._id,
            quantity: item.quantity,
            price: item.price,
        }));

        const finalOrderPayload = {
            ...orderData,
            items: formattedItems,
            subtotal,
        };

        try {
            const response = await axios.post('/orders', finalOrderPayload);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal membuat pesanan.');
        }
    }
);

// ✅ Thunk: Ambil semua pesanan (kasir)
export const fetchOrders = createAsyncThunk(
    'orders/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.get('/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengambil data pesanan.');
        }
    }
);

// ✅ Thunk: Update status pesanan
export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ orderId, status }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.patch(
                `/orders/${orderId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal memperbarui status pesanan.');
        }
    }
);

// ✅ Thunk: Ambil status pesanan customer
export const fetchCustomerOrderStatus = createAsyncThunk(
    'orders/fetchStatus',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/orders/status/${orderId}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Pesanan tidak ditemukan.');
        }
    }
);

// ✅ Thunk BARU: Tandai pesanan sudah dibayar (kasir)
// Tambahkan ini di atas
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export const markOrderAsPaid = createAsyncThunk(
    'orders/markAsPaid',
    async (orderId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `/orders/${orderId}/mark-paid`,
                {}, // tidak perlu body
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal update status bayar');
        }
    }
);


const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existing = state.cart.find(i => i._id === item._id);
            if (existing) {
                existing.quantity += 1;
            } else {
                state.cart.push({ ...item, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(state.cart));
        },
        updateCartQuantity: (state, action) => {
            const { itemId, quantity } = action.payload;
            const item = state.cart.find((i) => i._id === itemId);
            if (item) {
                if (quantity <= 0) {
                    state.cart = state.cart.filter((i) => i._id !== itemId);
                } else {
                    item.quantity = quantity;
                }
            }
            localStorage.setItem('cart', JSON.stringify(state.cart));
        },
        clearCart: (state) => {
            state.cart = [];
            localStorage.removeItem('cart');
        },
        setCurrentOrderFromStorage: (state, action) => {
            state.currentOrder = action.payload;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        addOrderRealtime: (state, action) => {
            const exists = state.orders.some(order => order._id === action.payload._id);
            if (!exists) {
                state.orders.push(action.payload);
            }
        },
        updateOrderRealtime: (state, action) => {
            const updatedOrder = action.payload;

            const index = state.orders.findIndex(order => order._id === updatedOrder._id);
            if (index !== -1) {
                state.orders[index] = updatedOrder;
            }

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
            .addCase(createOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
                sessionStorage.setItem('currentOrder', JSON.stringify(action.payload));
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })

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
            })

            // ✅ Reducer untuk "Sudah Bayar"
            .addCase(markOrderAsPaid.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(markOrderAsPaid.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
            })
            .addCase(markOrderAsPaid.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const {
    addToCart,
    updateCartQuantity,
    clearCart,
    clearCurrentOrder,
    addOrderRealtime,
    updateOrderRealtime,
    addOrdersBatch,
    setCurrentOrderFromStorage
} = orderSlice.actions;

export const selectAllOrders = (state) => state.orders.orders;
export const selectCart = (state) => state.orders.cart;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;

export default orderSlice.reducer;
