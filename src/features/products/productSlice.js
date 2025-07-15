import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios'; // Pastikan path ini benar

// Initial state untuk slice produk
const initialState = {
    items: [], // untuk menampung semua item produk/menu
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

/**
 * Async Thunk untuk MENGAMBIL SEMUA PRODUK (menu)
 * Memanggil endpoint: GET /products
 */
export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/products');
            return response.data;
        } catch (err) {
            if (!err.response) throw err;
            return rejectWithValue(err.response.data);
        }
    }
);

/**
 * Async Thunk untuk MENAMBAH PRODUK BARU (oleh admin)
 * Memanggil endpoint: POST /products
 */
export const addNewProduct = createAsyncThunk(
    'products/addNew',
    async (productData, { getState, rejectWithValue }) => {
        try {
            // productData harus berupa objek FormData karena ada file gambar
            const token = getState().auth.token; // Mengambil token dari authSlice
            const response = await axios.post('/products', productData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
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

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {}, // Tidak ada reducer sinkron untuk saat ini
    extraReducers: (builder) => {
        builder
            // Kasus untuk fetchProducts (mengambil semua menu)
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Gagal memuat produk.';
            })
            // Kasus untuk addNewProduct
            .addCase(addNewProduct.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addNewProduct.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Tambahkan produk baru ke daftar state tanpa perlu fetch ulang
                state.items.unshift(action.payload);
            })
            .addCase(addNewProduct.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || 'Gagal menambahkan produk.';
            });
    },
});

// Ekspor selectors
export const selectAllProducts = (state) => state.products.items;
export const selectProductsStatus = (state) => state.products.status;
export const selectProductsError = (state) => state.products.error;

export default productSlice.reducer;