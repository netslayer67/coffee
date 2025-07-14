
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const menuCategories = [
  {
    id: 'coffee',
    name: 'Coffee',
    icon: '☕',
    items: [
      {
        id: 1,
        name: 'Espresso Premium',
        price: 25000,
        description: 'Rich, bold espresso with perfect crema',
        image: 'Premium espresso shot with golden crema',
        rating: 4.9,
        prepTime: '2-3 min',
        isPopular: true
      },
      {
        id: 2,
        name: 'Cappuccino Deluxe',
        price: 35000,
        description: 'Creamy cappuccino with artistic latte art',
        image: 'Beautiful cappuccino with latte art',
        rating: 4.8,
        prepTime: '3-4 min',
        isPopular: true
      },
      {
        id: 3,
        name: 'Americano Classic',
        price: 28000,
        description: 'Smooth americano for coffee purists',
        image: 'Classic americano in elegant cup',
        rating: 4.7,
        prepTime: '2-3 min'
      },
      {
        id: 4,
        name: 'Latte Signature',
        price: 38000,
        description: 'Silky smooth latte with house blend',
        image: 'Creamy latte with perfect foam',
        rating: 4.9,
        prepTime: '3-4 min',
        isPopular: true
      }
    ]
  },
  {
    id: 'specialty',
    name: 'Specialty',
    icon: '✨',
    items: [
      {
        id: 5,
        name: 'Caramel Macchiato',
        price: 42000,
        description: 'Sweet caramel with espresso layers',
        image: 'Layered caramel macchiato with drizzle',
        rating: 4.8,
        prepTime: '4-5 min',
        isPopular: true
      },
      {
        id: 6,
        name: 'Mocha Fusion',
        price: 40000,
        description: 'Rich chocolate meets premium coffee',
        image: 'Decadent mocha with chocolate garnish',
        rating: 4.7,
        prepTime: '4-5 min'
      },
      {
        id: 7,
        name: 'Vanilla Bean Latte',
        price: 39000,
        description: 'Aromatic vanilla with smooth espresso',
        image: 'Vanilla latte with bean garnish',
        rating: 4.6,
        prepTime: '3-4 min'
      }
    ]
  },
  {
    id: 'cold',
    name: 'Cold Brew',
    icon: '🧊',
    items: [
      {
        id: 8,
        name: 'Iced Americano',
        price: 30000,
        description: 'Refreshing cold americano over ice',
        image: 'Iced americano with ice cubes',
        rating: 4.5,
        prepTime: '2-3 min'
      },
      {
        id: 9,
        name: 'Cold Brew Original',
        price: 32000,
        description: 'Smooth cold brew, 12-hour extraction',
        image: 'Cold brew coffee in tall glass',
        rating: 4.8,
        prepTime: '1-2 min'
      },
      {
        id: 10,
        name: 'Frappé Delight',
        price: 45000,
        description: 'Blended coffee with whipped cream',
        image: 'Frappé with whipped cream topping',
        rating: 4.7,
        prepTime: '3-4 min',
        isPopular: true
      }
    ]
  },
  {
    id: 'pastry',
    name: 'Pastries',
    icon: '🥐',
    items: [
      {
        id: 11,
        name: 'Croissant Butter',
        price: 18000,
        description: 'Flaky, buttery French croissant',
        image: 'Golden butter croissant',
        rating: 4.6,
        prepTime: '1-2 min'
      },
      {
        id: 12,
        name: 'Chocolate Muffin',
        price: 22000,
        description: 'Rich chocolate muffin with chips',
        image: 'Chocolate chip muffin',
        rating: 4.5,
        prepTime: '1-2 min'
      },
      {
        id: 13,
        name: 'Cheesecake Slice',
        price: 35000,
        description: 'Creamy New York style cheesecake',
        image: 'Slice of creamy cheesecake',
        rating: 4.9,
        prepTime: '1-2 min',
        isPopular: true
      }
    ]
  }
];

export default function MenuPage({ addToCart, cart }) {
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const currentCategory = menuCategories.find(cat => cat.id === selectedCategory);
    if (currentCategory) {
      const filtered = currentCategory.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [selectedCategory, searchTerm]);

  const handleAddToCart = (item) => {
    addToCart(item);
    toast({
      title: "Ditambahkan ke keranjang! 🛒",
      description: `${item.name} berhasil ditambahkan`,
      duration: 2000,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          Menu Premium
        </motion.h1>
        <motion.p
          className="text-lg text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Nikmati pengalaman kopi terbaik dengan menu pilihan berkualitas premium
        </motion.p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Cari menu favorit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
          />
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {menuCategories.map((category, index) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white/10 backdrop-blur-xl text-gray-300 hover:bg-white/20 hover:text-white border border-white/10'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="font-medium">{category.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Menu Items Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -8 }}
            className="group relative"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-full transition-all duration-500 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-amber-500/10">
              {/* Popular Badge */}
              {item.isPopular && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                  <Flame className="w-3 h-3" />
                  <span>Popular</span>
                </div>
              )}

              {/* Image */}
              <div className="relative mb-4 overflow-hidden rounded-2xl">
                <img  
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={item.name}
                 src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors duration-300">
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{item.rating}</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{item.prepTime}</span>
                  </div>
                  <span className="text-lg font-bold text-amber-400">
                    {formatPrice(item.price)}
                  </span>
                </div>

                <Button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah ke Keranjang
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Menu tidak ditemukan</h3>
          <p className="text-gray-400">Coba kata kunci lain atau pilih kategori berbeda</p>
        </motion.div>
      )}
    </div>
  );
}
