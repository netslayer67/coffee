import { createSlice } from '@reduxjs/toolkit';
// Axios dan createAsyncThunk tidak lagi diperlukan di file ini

// Coba ambil data sesi customer dari sessionStorage saat aplikasi pertama kali dimuat
const sessionData = JSON.parse(sessionStorage.getItem('customerSession'));

// Initial state baru yang lebih sederhana
const initialState = {
    session: sessionData ? sessionData : {
        customerName: null,
        orderType: null, // 'dine-in' atau 'take away'
        tableId: null,
        tableNumber: null,
        orderId: null,
        paymentMethod: null,
    },
    // Properti status dan error tidak lagi relevan karena tidak ada API call
};

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    // Reducers sekarang semuanya sinkron
    reducers: {
        /**
         * Action baru untuk memulai sesi di frontend.
         * Ini akan dipanggil dari CustomerLandingPage.
         */
        startSession: (state, action) => {
            const { customerName, orderType } = action.payload;
            state.session.customerName = customerName;
            state.session.orderType = orderType;
            // Simpan sesi awal ke sessionStorage
            sessionStorage.setItem('customerSession', JSON.stringify(state.session));
        },

        /**
         * Action untuk memperbarui sesi dengan data pesanan setelah dibuat.
         */
        updateSessionWithOrder: (state, action) => {
            const order = action.payload;
            if (order && order._id) {
                state.session.orderId = order._id;
                sessionStorage.setItem('customerSession', JSON.stringify(state.session));
            }
        },

        /**
         * Action untuk mengatur meja (jika dine-in).
         */
        setTableInfo: (state, action) => {
            state.session.tableId = action.payload.tableId;
            state.session.tableNumber = action.payload.tableName;
            sessionStorage.setItem('customerSession', JSON.stringify(state.session));
        },

        /**
         * Action untuk mengatur metode pembayaran.
         */
        setPaymentMethod: (state, action) => {
            state.session.paymentMethod = action.payload;
            sessionStorage.setItem('customerSession', JSON.stringify(state.session));
        },

        /**
         * Action untuk membersihkan sesi pelanggan secara menyeluruh.
         */
        clearCustomerSession: (state) => {
            state.session = {
                customerName: null,
                orderType: null,
                tableId: null,
                tableNumber: null,
                orderId: null,
                paymentMethod: null,
            };

            sessionStorage.removeItem('customerSession');
            sessionStorage.removeItem('currentOrder');
            localStorage.removeItem('cart');
        },

    },
    // extraReducers dihapus karena `startCustomerSession` sudah tidak ada
});

// Ekspor semua action yang relevan
export const {
    startSession,
    updateSessionWithOrder,
    setTableInfo,
    setPaymentMethod,
    clearCustomerSession
} = customerSlice.actions;

// Ekspor selectors
export const selectCustomerSession = (state) => state.customer.session;

export default customerSlice.reducer;