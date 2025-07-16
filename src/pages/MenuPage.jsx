// src/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Search, Flame, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// 1. Impor hooks dan actions dari Redux
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectAllProducts, selectProductsStatus } from '../features/products/productSlice';
import { handleAddToCart } from '../features/orders/orderSlice';
import { updateSessionWithOrder } from '../features/customer/customerSlice';

const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

export default function MenuPage() {
  const dispatch = useDispatch();

  // 2. Ambil state dari Redux store
  const products = useSelector(selectAllProducts);
  const productStatus = useSelector(selectProductsStatus);

  // State lokal untuk filter dan kategori
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  // Kategori menu, bisa juga diambil dari API jika dinamis
  const menuCategories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'coffee', name: 'Coffee', icon: '☕' },
    { id: 'specialty', name: 'Specialty', icon: '✨' },
    { id: 'cold', name: 'Cold Brew', icon: '🧊' },
    { id: 'pastry', name: 'Pastries', icon: '🥐' },
    { id: 'other', name: 'Other', icon: '🍹' },
  ];

  // 3. Ambil data produk dari backend saat komponen dimuat
  useEffect(() => {
    if (productStatus === 'idle') {
      dispatch(fetchProducts());
    }
  }, [productStatus, dispatch]);

  // 4. Logika untuk memfilter produk berdasarkan pencarian dan kategori
  useEffect(() => {
    let itemsToFilter = [...products];

    // Filter berdasarkan kategori
    if (selectedCategory !== 'all') {
      itemsToFilter = itemsToFilter.filter(item => item.category === selectedCategory);
    }

    // Filter berdasarkan kata kunci pencarian
    if (searchTerm) {
      itemsToFilter = itemsToFilter.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Jika ada pencarian, reset filter kategori agar pencarian lebih luas
      if (selectedCategory !== 'all') setSelectedCategory('all');
    }

    setFilteredItems(itemsToFilter);
  }, [selectedCategory, searchTerm, products]);


  // 5. Handle penambahan item ke keranjang belanja melalui Redux
  const handleAddToCartClick = (item) => {
    dispatch(handleAddToCart(item))
      .unwrap()
      .then((createdOrder) => {
        // `createdOrder` adalah hasil dari thunk, yang berisi pesanan yang aktif
        if (createdOrder) {
          // Perbarui sesi pelanggan dengan data pesanan baru
          dispatch(updateSessionWithOrder(createdOrder));
        }
        toast({
          title: "Ditambahkan ke Keranjang! 🛒",
          description: `Pilihan yang bagus: ${item.name}.`,
          duration: 2000,
        });
      })
      .catch((error) => {
        toast({
          title: "Gagal Menambahkan",
          description: error || "Tidak dapat menambahkan item ke keranjang.",
          variant: "destructive",
        });
      });
  };

  // --- Variants (tidak ada perubahan) ---
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* ... (Bagian judul dan deskripsi tidak ada perubahan) ... */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Our Curated Menu
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Discover a world of flavor, crafted with passion and the finest ingredients.
        </p>
      </motion.div>


      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-6 mb-12"
      >
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" placeholder="Search for your favorite..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div className="flex items-center justify-center flex-wrap gap-3">
          {menuCategories.map(category => (
            <motion.button
              key={category.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchTerm('');
              }}
              className={`px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300 text-sm font-medium ${selectedCategory === category.id
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Menu Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {productStatus === 'loading' ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <motion.div
                key={item._id} // Gunakan _id dari MongoDB
                layout variants={itemVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.4, type: 'spring' }}
                className="group relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/20"
              >
                <div className="relative">
                  {item.isPopular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                      <Flame className="w-3.5 h-3.5" /> <span className="font-bold">POPULAR</span>
                    </div>
                  )}
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={item.imageUrl} // Gunakan imageUrl dari backend
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>

                <div className="p-6 relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white pr-4">{item.name}</h3>
                    <div className="flex-shrink-0 flex items-center gap-1 text-amber-400">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-md font-bold text-white">{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 h-10">{item.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-2xl font-bold text-amber-400">{formatPrice(item.price)}</p>
                    <Button
                      onClick={() => handleAddToCartClick(item)}
                      size="icon"
                      className="w-12 h-12 bg-white/10 hover:bg-amber-500 rounded-full transition-all duration-300 group-hover:bg-amber-500"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 col-span-full">
              <div className="text-6xl mb-4">🧐</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No Matches Found</h3>
              <p className="text-gray-400">Try a different search term or category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}