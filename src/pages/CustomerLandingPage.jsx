// src/pages/CustomerLandingPage.jsx
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
        title: "Whoops! Something's missing.",
        description: "Please enter your name and select a table to begin.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setCustomerInfo({ name, tableNumber: selectedTable.name });
    toast({
      title: `Welcome, ${name}!`,
      description: `You're at table ${selectedTable.name}. Let's find something delicious.`,
      duration: 3000,
    });
    navigateTo('menu');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Welcome to Café Horizon
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Your premium coffee experience starts here. Just a few details and you're all set.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/20"
        >
          <div className="mb-8">
            <label htmlFor="customer-name" className="block text-lg font-medium text-gray-200 mb-3">
              What should we call you?
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Choose your table</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {tables.map(table => (
                <motion.button
                  key={table.id}
                  whileHover={{ scale: table.status === 'available' ? 1.1 : 1, y: table.status === 'available' ? -5 : 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => table.status === 'available' && setSelectedTable(table)}
                  disabled={table.status === 'occupied'}
                  className={`p-4 rounded-xl text-center transition-all duration-300 border-2 flex flex-col items-center justify-center aspect-square ${selectedTable?.id === table.id
                      ? 'bg-amber-500 border-amber-300 text-white shadow-lg shadow-amber-500/30'
                      : table.status === 'occupied'
                        ? 'bg-red-900/50 border-red-500/30 text-gray-500 cursor-not-allowed'
                        : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-amber-500/50'
                    }`}
                >
                  <Armchair className="w-8 h-8 mb-1" />
                  <span className="font-bold">{table.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStartOrder}
            disabled={!name || !selectedTable}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start My Order <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}