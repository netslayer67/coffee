import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios'; // Pastikan path ini benar

// Initial state untuk slice meja
const initialState = {
    items: [], // untuk menampung semua data meja
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

/**
 * Async Thunk untuk MENGAMBIL SEMUA MEJA
 * Memanggil endpoint: GET /tables
 * Ini adalah aksi publik, tidak perlu token.
 */
export const fetchTables = createAsyncThunk(
    'tables/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/tables');
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
);

/**
 * Async Thunk untuk MEMBUAT MEJA BARU (satu atau banyak)
 * Memanggil endpoint: POST /tables
 */
export const createTables = createAsyncThunk(
    'tables/create',
    async (tablesData, { getState, rejectWithValue }) => {
        // tablesData bisa berupa objek tunggal { tableNumber: 'A1' }
        // atau array objek [{ tableNumber: 'A2' }, { tableNumber: 'A3' }]
        try {
            const token = getState().auth.token; // Mengambil token dari authSlice
            const response = await axios.post('/tables', tablesData, {
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

const tableSlice = createSlice({
    name: 'tables',
    initialState,
    reducers: {}, // Tidak ada reducer sinkron untuk saat ini
    extraReducers: (builder) => {
        builder
            // Kasus untuk fetchTables
            .addCase(fetchTables.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTables.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchTables.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Gagal memuat data meja.';
            })
            // Kasus untuk createTables
            .addCase(createTables.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createTables.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Logika untuk menambahkan meja baru ke state
                if (Array.isArray(action.payload.tables)) {
                    // Jika respons berisi array (dari bulk create)
                    state.items.push(...action.payload.tables);
                } else {
                    // Jika respons adalah objek tunggal
                    state.items.push(action.payload);
                }
            })
            .addCase(createTables.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Gagal menambahkan meja.';
            });
    },
});

// Ekspor selectors
export const selectAllTables = (state) => state.tables.items;
export const selectTableStatus = (state) => state.tables.status;
export const selectTableError = (state) => state.tables.error;

export default tableSlice.reducer;