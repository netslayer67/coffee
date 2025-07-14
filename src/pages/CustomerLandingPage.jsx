import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Armchair, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const tables = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `A${i + 1}`,
  status: Math.random() > 0.7 ? 'occupied' : 'available',
}));

export default function CustomerLandingPage({ setCustomerInfo, navigateTo }) {
  const [name, setName] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  const handleStartOrder = () => {
    if (!name || !selectedTable) {
      toast({
        title: "Informasi Kurang Lengkap",
        description: "Silakan isi nama Anda dan pilih meja.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setCustomerInfo({ name, tableNumber: selectedTable.name });
    toast({
      title: `Selamat Datang, ${name}!`,
      description: `Anda berada di meja ${selectedTable.name}. Silakan lihat menu kami.`,
      duration: 3000,
    });
    navigateTo('menu');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Selamat Datang di Café Horizon
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Silakan isi nama Anda dan pilih meja untuk memulai pesanan.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8"
      >
        <div className="mb-8">
          <label htmlFor="customer-name" className="block text-lg font-medium text-gray-200 mb-3">
            Nama Anda
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Pilih Meja Anda</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {tables.map(table => (
              <motion.button
                key={table.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => table.status === 'available' && setSelectedTable(table)}
                disabled={table.status === 'occupied'}
                className={`p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                  selectedTable?.id === table.id
                    ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/25'
                    : table.status === 'occupied'
                    ? 'bg-red-500/20 border-red-500/30 text-gray-400 cursor-not-allowed'
                    : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                <Armchair className="mx-auto w-8 h-8 mb-1" />
                <span className="font-bold">{table.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleStartOrder}
          disabled={!name || !selectedTable}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mulai Pesan <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}