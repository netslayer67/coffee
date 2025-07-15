// src/components/cashier/CashierFilters.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Search, ListFilter, Clock, UtensilsCrossed, CheckCircle } from 'lucide-react';

// Opsi filter bisa disimpan di sini atau dioper dari props jika dinamis
const filterOptions = [
  { value: 'all', label: 'Semua', icon: ListFilter },
  { value: 'pending', label: 'Menunggu', icon: Clock },
  { value: 'preparing', label: 'Disiapkan', icon: UtensilsCrossed },
  { value: 'ready', label: 'Siap', icon: CheckCircle },
];

export default function CashierFilters({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4"
    >
      {/* Input Pencarian */}
      <div className="relative flex-grow">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Cari No Pesanan, Nama, atau Meja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
        />
      </div>

      {/* Tombol Filter Status */}
      <div className="flex items-center justify-center bg-black/20 p-1 rounded-lg">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`relative px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors duration-300 ${statusFilter === option.value ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <option.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{option.label}</span>
            {statusFilter === option.value && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-amber-500/80 rounded-md -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}