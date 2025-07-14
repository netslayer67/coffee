// src/pages/MenuPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Search, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// (Keep your menuCategories data structure as is)
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

export default function MenuPage({ addToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    const allItems = menuCategories.flatMap(cat => cat.items);
    let itemsToFilter = allItems;

    if (selectedCategory !== 'all') {
      const category = menuCategories.find(cat => cat.id === selectedCategory);
      itemsToFilter = category ? category.items : [];
    }

    if (searchTerm) {
      itemsToFilter = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // if search is active, deactivate category filter for better UX
      if (selectedCategory !== 'all') setSelectedCategory('all');
    }

    setFilteredItems(itemsToFilter);
  }, [selectedCategory, searchTerm]);

  const handleAddToCart = (item) => {
    addToCart(item);
    toast({
      title: "Added to Cart! 🛒",
      description: `A great choice: ${item.name}.`,
      duration: 2000,
    });
  };

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Our Curated Menu
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Discover a world of flavor, crafted with passion and the finest ingredients.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-6 mb-12"
      >
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for your favorite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <div className="flex items-center justify-center flex-wrap gap-3">
          {[{ id: 'all', name: 'All', icon: '🌟' }, ...menuCategories].map(category => (
            <motion.button
              key={category.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategory(category.id);
                setSearchTerm(''); // Clear search on category click
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
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="group relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/20"
            >
              <div className="relative">
                {item.isPopular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="font-bold">POPULAR</span>
                  </div>
                )}
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1511920183353-3c9ba4ceda92?q=80&w=2070"
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
                    onClick={() => handleAddToCart(item)}
                    size="icon"
                    className="w-12 h-12 bg-white/10 hover:bg-amber-500 rounded-full transition-all duration-300 group-hover:bg-amber-500"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 col-span-full"
        >
          <div className="text-6xl mb-4">🧐</div>
          <h3 className="text-2xl font-semibold text-white mb-2">No Matches Found</h3>
          <p className="text-gray-400">Try a different search term or category.</p>
        </motion.div>
      )}
    </div>
  );
}