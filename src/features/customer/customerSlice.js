import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const sessionData = JSON.parse(sessionStorage.getItem('customerSession'));

const initialState = {
    session: sessionData ? sessionData : {
        customerName: null,
        tableId: null,
        tableNumber: null,
        orderId: null,
        paymentMethod: null, // <-- Tambahkan properti ini
    },
    status: 'idle',
    error: null,
};

/**
 * Async Thunk untuk memulai dan memvalidasi sesi pelanggan.
 * Ini akan memanggil endpoint POST /customer/start-session
 */
export const startCustomerSession = createAsyncThunk(
    'customer/startSession',
    async (sessionInfo, { rejectWithValue }) => {
        try {
            const response = await axios.post('/customer/start-session', sessionInfo);
            sessionStorage.setItem('customerSession', JSON.stringify(response.data.sessionData));
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
);

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    // Reducers sinkron biasa
    reducers: {
        // Aksi untuk membersihkan sesi pelanggan, misalnya setelah selesai bayar
        clearCustomerSession: (state) => {
            state.session = { customerName: null, tableId: null, tableNumber: null, orderId: null, paymentMethod: null };
            state.status = 'idle';
            state.error = null;
            sessionStorage.removeItem('customerSession');
        },
        // --- PERBAIKAN LOGIKA DI SINI ---
        updateSessionWithOrder: (state, action) => {
            const order = action.payload; // Payload sekarang adalah objek pesanan lengkap

            if (order && order._id) {
                // Ambil `_id` dari objek order dan simpan sebagai orderId
                state.session.orderId = order._id;

                // Simpan kembali ke sessionStorage agar persisten
                sessionStorage.setItem('customerSession', JSON.stringify(state.session));
            } else {
                console.error("Gagal memperbarui sesi: payload pesanan tidak valid.", order);
            }
        },
        // --- TAMBAHKAN REDUCER INI ---
        setPaymentMethod: (state, action) => {
            state.session.paymentMethod = action.payload;
            sessionStorage.setItem('customerSession', JSON.stringify(state.session));
        },
        // Aksi untuk menyimpan nama meja yang dipilih, ini bisa dipanggil
        // bersamaan dengan tableId untuk pengalaman pengguna yang lebih baik
        setTableInfo: (state, action) => {
            state.session.tableId = action.payload.tableId;
            state.session.tableName = action.payload.tableName;
        }
    },
    // Extra reducers untuk menangani lifecycle dari async thunk
    extraReducers: (builder) => {
        builder
            .addCase(startCustomerSession.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(startCustomerSession.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.session = action.payload.sessionData;
            })
            .addCase(startCustomerSession.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message || 'Gagal memulai sesi.';
            });
    },
});

// Ekspor aksi dan reducer
export const { clearCustomerSession, setTableInfo, updateSessionWithOrder, setPaymentMethod } = customerSlice.actions;

// Ekspor selectors untuk memudahkan akses state di komponen
export const selectCustomerSession = (state) => state.customer.session;
export const selectCustomerStatus = (state) => state.customer.status;
export const selectCustomerError = (state) => state.customer.error;

export default customerSlice.reducer;