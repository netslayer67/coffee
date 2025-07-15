import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
    users: [],
    status: 'idle',
    error: null,
};

/**
 * Async Thunk untuk MENGAMBIL SEMUA PENGGUNA (kasir)
 * Memanggil endpoint: GET /users
 */
export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            const response = await axios.get('/users', {
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
 * Async Thunk untuk MENGHAPUS PENGGUNA (oleh admin)
 * Memanggil endpoint: DELETE /users/:id
 */
export const deleteUser = createAsyncThunk(
    'users/delete',
    async (userId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            await axios.delete(`/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return userId; // Kirim kembali ID pengguna yang dihapus
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Kasus untuk fetchUsers
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Gagal memuat data pengguna.';
            })
            // Kasus untuk deleteUser
            .addCase(deleteUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Hapus pengguna dari state tanpa perlu fetch ulang
                state.users = state.users.filter(user => user._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Gagal menghapus pengguna.';
            });
    },
});

// Ekspor selectors
export const selectAllUsers = (state) => state.users.users;
export const selectUserStatus = (state) => state.users.status;
export const selectUserError = (state) => state.users.error;

export default userSlice.reducer;