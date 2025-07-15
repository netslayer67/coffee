// src/pages/CustomerLandingPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Armchair, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// 1. Impor hooks dan actions dari Redux
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables, selectAllTables, selectTableStatus } from '../features/tables/tableSlice';
import { startCustomerSession, selectCustomerStatus, selectCustomerError, setTableInfo } from '../features/customer/customerSlice';

export default function CustomerLandingPage({ navigateTo }) { // Hapus props setCustomerInfo
  const dispatch = useDispatch();

  // 2. Ambil state dari Redux store
  const tables = useSelector(selectAllTables);
  const tableStatus = useSelector(selectTableStatus);
  const customerStatus = useSelector(selectCustomerStatus);
  const customerError = useSelector(selectCustomerError);

  // State lokal untuk komponen
  const [name, setName] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  // 3. Ambil data meja dari backend saat komponen pertama kali dimuat
  useEffect(() => {
    if (tableStatus === 'idle') {
      dispatch(fetchTables());
    }
  }, [tableStatus, dispatch]);

  // Efek untuk menampilkan toast error jika validasi sesi gagal
  useEffect(() => {
    if (customerStatus === 'failed' && customerError) {
      toast({
        title: "Sesi Gagal Dimulai",
        description: customerError,
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [customerStatus, customerError]);


  const handleTableSelect = (table) => {
    if (table.isAvailable) {
      setSelectedTable(table);
      // Simpan info meja ke state customer untuk UX yang lebih baik
      dispatch(setTableInfo({ tableId: table._id, tableName: table.tableNumber }));
    }
  };

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

    // 4. Dispatch aksi untuk memulai dan memvalidasi sesi
    dispatch(startCustomerSession({ customerName: name, tableId: selectedTable._id }))
      .unwrap() // .unwrap() akan melempar error jika thunk ditolak (rejected)
      .then((result) => {
        // Jika berhasil, backend akan mengembalikan data sesi
        toast({
          title: `Welcome, ${result.sessionData.customerName}!`,
          description: `You're at table ${selectedTable.tableNumber}. Let's find something delicious.`,
          duration: 3000,
        });
        navigateTo('menu');
      })
      .catch((err) => {
        // Error sudah ditangani oleh useEffect di atas, tapi bisa ditambahkan log di sini
        console.error("Validation failed:", err);
      });
  };

  // --- Variants (tidak ada perubahan) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
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
        {/* ... (bagian judul dan deskripsi tidak ada perubahan) ... */}
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
          {/* ... (bagian input nama tidak ada perubahan) ... */}
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
              {/* 5. Render meja dari state Redux */}
              {tableStatus === 'loading' && <p>Loading tables...</p>}
              {tables.map(table => (
                <motion.button
                  key={table._id} // Gunakan _id dari MongoDB
                  whileHover={{ scale: table.isAvailable ? 1.1 : 1, y: table.isAvailable ? -5 : 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTableSelect(table)}
                  disabled={!table.isAvailable} // Kondisi disable berdasarkan isAvailable
                  className={`p-4 rounded-xl text-center transition-all duration-300 border-2 flex flex-col items-center justify-center aspect-square ${selectedTable?._id === table._id
                    ? 'bg-amber-500 border-amber-300 text-white shadow-lg shadow-amber-500/30'
                    : !table.isAvailable
                      ? 'bg-red-900/50 border-red-500/30 text-gray-500 cursor-not-allowed'
                      : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-amber-500/50'
                    }`}
                >
                  <Armchair className="w-8 h-8 mb-1" />
                  <span className="font-bold">{table.tableNumber}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStartOrder}
            disabled={!name || !selectedTable || customerStatus === 'loading'}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {customerStatus === 'loading' ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Validating...</>
            ) : (
              <>Start My Order <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}