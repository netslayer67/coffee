import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
    transactionToken: null,
    transactionRedirectUrl: null,
    currentPayment: null,
    status: 'idle',
    error: null,
};


/**
 * 🔄 1. Save Payment Method to Order in DB
 */
export const savePaymentMethod = createAsyncThunk(
    'payments/saveMethod',
    async ({ orderId, method }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`/orders/${orderId}/payment-method`, { method });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Gagal menyimpan metode pembayaran' });
        }
    }
);


/**
 * 💳 2. Create Midtrans Transaction
 */
export const createPaymentTransaction = createAsyncThunk(
    'payments/createTransaction',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.post('/payments/create-transaction', { orderId });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Gagal membuat transaksi' });
        }
    }
);

/**
 * 💵 3. Handle Cash Payment
 */
export const processCashPayment = createAsyncThunk(
    'payments/processCash',
    async (order, { dispatch }) => {
        console.log(`Order ${order.orderNumber} dibayar di kasir.`);
        return { orderId: order._id, paymentMethod: 'cashier' };
    }
);

const paymentSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        clearPaymentState: (state) => {
            state.transactionToken = null;
            state.transactionRedirectUrl = null;
            state.currentPayment = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // 🔄 Save Payment Method
            .addCase(savePaymentMethod.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(savePaymentMethod.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(savePaymentMethod.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Gagal menyimpan metode pembayaran';
            })

            // 💳 Midtrans Transaction
            .addCase(createPaymentTransaction.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createPaymentTransaction.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.transactionToken = action.payload.token;
                state.transactionRedirectUrl = action.payload.redirect_url;
                state.currentPayment = action.payload;
            })
            .addCase(createPaymentTransaction.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Gagal membuat transaksi pembayaran';
            })

            // 💵 Cash Payment
            .addCase(processCashPayment.fulfilled, (state) => {
                state.status = 'succeeded';
            });
    },
});

// Actions
export const { clearPaymentState } = paymentSlice.actions;

// Selectors
export const selectTransactionToken = (state) => state.payments.transactionToken;
export const selectPaymentStatus = (state) => state.payments.status;
export const selectPaymentError = (state) => state.payments.error;

export default paymentSlice.reducer;
