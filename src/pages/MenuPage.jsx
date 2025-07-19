// src/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Search, Flame, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectAllProducts, selectProductsStatus } from '../features/products/productSlice';
// --- PERUBAHAN 1: Ganti import `handleAddToCart` dengan `addToCart` ---
import { addToCart } from '../features/orders/orderSlice';
// 'updateSessionWithOrder' tidak lagi diperlukan di sini
// import { updateSessionWithOrder } from '../features/customer/customerSlice';

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

const menuCategories = [
  { id: 'all', name: 'All', icon: '🌟' },
  { id: 'coffee', name: 'Coffee', icon: '☕' },
  { id: 'specialty', name: 'Specialty', icon: '✨' },
  { id: 'cold', name: 'Cold Brew', icon: '🧊' },
  { id: 'pastry', name: 'Pastries', icon: '🥐' },
  { id: 'other', name: 'Other', icon: '🍹' },
];

export default function MenuPage() {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const productStatus = useSelector(selectProductsStatus);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (productStatus === 'idle') {
      dispatch(fetchProducts());
    }
  }, [productStatus, dispatch]);

  useEffect(() => {
    let items = [...products];
    if (selectedCategory !== 'all') {
      items = items.filter((item) => item.category === selectedCategory);
    }
    if (searchTerm) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (selectedCategory !== 'all') setSelectedCategory('all');
    }
    setFilteredItems(items);
  }, [selectedCategory, searchTerm, products]);

  // --- PERUBAHAN 2: Sederhanakan logika `handleAddToCartClick` ---
  const handleAddToCartClick = (item) => {
    // Cukup dispatch aksi `addToCart` dengan membawa data item.
    // Proses ini sekarang sinkron dan tidak perlu menangani promise.
    dispatch(addToCart(item));

    // Tampilkan notifikasi toast bahwa item berhasil ditambahkan.
    toast({
      title: 'Ditambahkan ke Keranjang! 🛒',
      description: `Pilihan yang bagus: ${item.name}.`,
      duration: 2000,
    });
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, transform: 'translate3d(0, 50px, 0)' },
    visible: { opacity: 1, scale: 1, transform: 'translate3d(0, 0, 0)' },
    exit: { opacity: 0, scale: 0.9, transform: 'translate3d(0, 30px, 0)' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-white">
      {/* Heading */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Our Curated Menu
        </h1>
        <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto">
          Discover a world of flavor, crafted with passion and the finest ingredients.
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-6 mb-12"
      >
        {/* Search Bar */}
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for your favorite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition duration-300"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center justify-center flex-wrap gap-3">
          {menuCategories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchTerm('');
              }}
              className={`px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300 text-sm font-medium ${selectedCategory === category.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
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
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {productStatus === 'loading' ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div
                key={item._id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4, type: 'spring' }}
                className="group bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all will-change-transform hover:shadow-amber-500/20"
              >
                <div className="relative">
                  {item.isPopular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="font-bold">POPULAR</span>
                    </div>
                  )}
                  <div className="aspect-square w-full overflow-hidden perspective">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="p-6 relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <div className="flex-shrink-0 flex items-center gap-1 text-amber-400">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold">{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-amber-400">{formatPrice(item.price)}</p>
                    <Button
                      onClick={() => handleAddToCartClick(item)}
                      size="icon"
                      className="w-12 h-12 bg-white/10 hover:bg-amber-500 rounded-full transition-all duration-300 group-hover:shadow-md"
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