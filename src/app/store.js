import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import customerReducer from '../features/customer/customerSlice';
import orderReducer from '../features/orders/orderSlice';
import productReducer from '../features/products/productSlice';
import tableReducer from '../features/tables/tableSlice'; // <-- Impor
import userReducer from '../features/users/userSlice'; // <-- Impor
import paymentReducer from '../features/payments/paymentSlice'; // <-- Impor

export const store = configureStore({
    reducer: {
        auth: authReducer,
        customer: customerReducer,
        orders: orderReducer,
        products: productReducer,
        tables: tableReducer, // <-- Daftarkan di sini
        users: userReducer,
        payments: paymentReducer
    },
});