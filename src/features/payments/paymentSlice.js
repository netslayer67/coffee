import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
    transactionToken: null, // Untuk menyimpan token Snap.js dari Midtrans
    transactionRedirectUrl: null, // URL redirect jika menggunakan QRIS
    currentPayment: null, // Untuk menyimpan detail pembayaran yang sedang berlangsung
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

/**
 * Async Thunk untuk MEMBUAT TRANSAKSI PEMBAYARAN
 * Ini akan memanggil endpoint POST /payments/create-transaction di backend,
 * yang selanjutnya akan membuat transaksi di Midtrans.
 */
export const createPaymentTransaction = createAsyncThunk(
    'payments/createTransaction',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.post('/payments/create-transaction', { orderId });
            // Backend akan mengembalikan respons dari Midtrans
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
);

/**
 * Async Thunk untuk menangani pembayaran di KASIR (cash)
 * Ini adalah simulasi, karena tidak ada interaksi API.
 * Kita hanya menandai pesanan untuk dibayar di kasir.
 */
export const processCashPayment = createAsyncThunk(
    'payments/processCash',
    async (order, { dispatch }) => {
        // Di dunia nyata, Anda mungkin akan mengirim notifikasi ke kasir.
        // Untuk saat ini, kita hanya set state dan mungkin dispatch aksi lain.
        console.log(`Order ${order.orderNumber} akan dibayar di kasir.`);
        // Setelah ini, frontend bisa langsung ke halaman struk.
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
            // Kasus untuk membuat transaksi Midtrans
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
                state.error = action.payload?.message || 'Gagal membuat transaksi pembayaran.';
            })
            // Kasus untuk pembayaran tunai
            .addCase(processCashPayment.fulfilled, (state, action) => {
                // Tidak banyak yang perlu diubah di state, karena
                // konfirmasi pembayaran akan datang dari kasir melalui webhook/socket.
                // Ini hanya untuk menandai alur di frontend.
                state.status = 'succeeded';
            });
    },
});

export const { clearPaymentState } = paymentSlice.actions;

// Selectors
export const selectTransactionToken = (state) => state.payments.transactionToken;
export const selectPaymentStatus = (state) => state.payments.status;
export const selectPaymentError = (state) => state.payments.error;

export default paymentSlice.reducer;