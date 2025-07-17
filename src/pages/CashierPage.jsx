// CashierPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  Search, Archive, Loader2, LogOut, LayoutDashboard
} from 'lucide-react';
import {
  fetchOrders, updateOrderStatus, selectAllOrders, selectOrderStatus,
  addOrderRealtime, updateOrderRealtime, addOrdersBatch
} from '../features/orders/orderSlice';
import {
  loginUser, selectCurrentUser, selectAuthStatus,
  selectAuthError, logout
} from '../features/auth/authSlice';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';
import OrderCard from '../components/OrderCard'; // Moved OrderCard into its own file for clarity
import LoginPage from '../components/LoginPage'; // Same with LoginPage

// Constants
const CACHE_KEY = 'cachedOrders';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helpers
const cacheOrders = (orders) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), orders }));
};
const getCachedOrders = () => {
  const raw = localStorage.getItem(CACHE_KEY);
  try {
    const parsed = JSON.parse(raw);
    return Date.now() - parsed.timestamp < CACHE_TTL ? parsed.orders : null;
  } catch {
    return null;
  }
};

// Visual background
const ParallaxBackground = () => {
  const { scrollY } = useScroll();
  const y = useSpring(scrollY, { stiffness: 20, damping: 10 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 w-full h-[120vh] bg-gradient-to-br from-black via-gray-900 to-black opacity-60 z-0"
      style={{ y }}
    />
  );
};

// Main dashboard
const CashierDashboard = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const status = useSelector(selectOrderStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rehydrating, setRehydrating] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const scrollRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL.replace("/api/v1", ""));
    const cached = getCachedOrders();

    const init = async () => {
      setRehydrating(true);
      if (cached) dispatch(addOrdersBatch(cached));

      const res = await dispatch(fetchOrders());
      if (res.meta.requestStatus === 'fulfilled') {
        cacheOrders(res.payload);
      } else {
        toast({
          title: "Gagal memuat pesanan",
          description: "Menggunakan data cache (jika tersedia)",
          variant: "destructive"
        });
      }

      setRehydrating(false);
    };

    init();

    socket.on('new_order', (o) => dispatch(addOrderRealtime(o)));
    socket.on('order_status_update', (o) => dispatch(updateOrderRealtime(o)));

    return () => socket.disconnect();
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const textMatch =
        o.orderNumber?.includes(searchTerm) ||
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.table?.tableNumber?.toString().includes(searchTerm);
      const statusMatch = statusFilter === 'all' || o.status === statusFilter;
      return textMatch && statusMatch;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      setVisibleCount((prev) => prev + 4);
    }
  };

  const handleUpdateStatus = (orderId, newStatus) =>
    dispatch(updateOrderStatus({ orderId, status: newStatus }));

  if (rehydrating) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <Loader2 className="animate-spin mr-2" />
        Memuat data...
      </div>
    );
  }

  return (
    <main className="relative z-10">
      <ParallaxBackground />
      <section className="relative z-10 px-4 pt-6 pb-28 max-w-7xl mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              Dasbor Kasir
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Kelola pesanan secara real-time</p>
          </div>
          <Button onClick={() => dispatch(logout())} variant="ghost" className="text-white text-sm sm:text-base">
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </Button>
        </header>

        {/* Search */}
        <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md mb-4 py-3 px-2 rounded-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              aria-label="Cari pesanan"
              type="text"
              placeholder="Cari No Pesanan / Nama / Meja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm sm:text-base rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
            />
          </div>
        </div>

        {/* Orders Grid */}
        <section
          ref={scrollRef}
          onScroll={handleScroll}
          role="list"
          aria-label="Daftar pesanan"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-h-[75vh] overflow-y-auto pr-2 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          <AnimatePresence mode="wait">
            {filteredOrders.length > 0 ? (
              filteredOrders.slice(0, visibleCount).map((order) => (
                <motion.div key={order._id} role="listitem">
                  <OrderCard
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    onViewReceipt={() => { }}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-20 text-gray-500"
              >
                <Archive className="mx-auto mb-4 w-10 h-10" aria-hidden="true" />
                Tidak ada pesanan
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </section>
    </main>
  );
};

// Entry point with auth gate
export default function CashierPage() {
  const currentUser = useSelector(selectCurrentUser);
  return currentUser ? <CashierDashboard /> : <LoginPage />;
}
