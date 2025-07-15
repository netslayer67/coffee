import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios'; // Pastikan path ini benar

// Coba ambil data user dan token dari localStorage saat aplikasi pertama kali dimuat
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// Initial state untuk slice autentikasi
const initialState = {
    user: user ? user : null,
    token: token ? token : null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

/**
 * Async Thunk untuk menangani request LOGIN
 * Ini akan memanggil endpoint POST /auth/login
 */
export const loginUser = createAsyncThunk(
    'auth/login', // Nama action type
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post('/auth/login', credentials);
            // Simpan data ke localStorage untuk menjaga sesi login
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (err) {
            // Jika request gagal (misal: password salah), kirim pesan error ke state
            if (!err.response) {
                throw err;
            }
            return rejectWithValue(err.response.data);
        }
    }
);

/**
 * Async Thunk untuk menangani request REGISTER
 * Ini akan memanggil endpoint POST /auth/register
 */
export const registerUser = createAsyncThunk(
    'auth/register', // Nama action type
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/auth/register', userData);
            return response.data; // Merespons dengan pesan sukses
        } catch (err) {
            // Tangani error, misalnya email sudah terdaftar
            if (!err.response) {
                throw err;
            }
            return rejectWithValue(err.response.data);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    // Reducers sinkron biasa
    reducers: {
        // Aksi untuk logout
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
    // Extra reducers untuk menangani lifecycle dari async thunks
    extraReducers: (builder) => {
        builder
            // Kasus untuk Login
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message || 'Login gagal';
            })
            // Kasus untuk Register
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.status = 'succeeded'; // Atau 'idle', karena setelah register biasanya perlu login
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message || 'Registrasi gagal';
            });
    },
});

// Ekspor aksi dan reducer
export const { logout } = authSlice.actions;

// Ekspor selectors untuk memudahkan akses state di komponen
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;