'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, Search, LogOut, Archive
} from 'lucide-react';

import {
  fetchOrders, updateOrderStatus, selectAllOrders, selectOrderStatus,
  addOrderRealtime, updateOrderRealtime, addOrdersBatch
} from '../features/orders/orderSlice';
import {
  selectCurrentUser, logout
} from '../features/auth/authSlice';

import OrderCard from '../components/OrderCard';
import OrderDetailModal from '../components/OrderDetailModal';
import LoginPage from '../components/LoginPage';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/use-toast';

// Cache helper
const CACHE_KEY = 'cachedOrders';
const CACHE_TTL = 5 * 60 * 1000;
const cacheOrders = (orders) => localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), orders }));
const getCachedOrders = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Date.now() - parsed.timestamp < CACHE_TTL ? parsed.orders : null;
  } catch {
    return null;
  }
};

const CashierDashboard = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const status = useSelector(selectOrderStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [rehydrating, setRehydrating] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // 👉 For Modal
  const scrollRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL.replace("/api/v1", ""));
    const cached = getCachedOrders();

    const init = async () => {
      setRehydrating(true);
      if (cached) dispatch(addOrdersBatch(cached));
      const res = await dispatch(fetchOrders());
      if (res.meta.requestStatus === 'fulfilled') cacheOrders(res.payload);
      else toast({ title: 'Gagal memuat pesanan', description: 'Menggunakan data cache', variant: 'destructive' });
      setRehydrating(false);
    };

    init();
    socket.on('new_order', (o) => dispatch(addOrderRealtime(o)));
    socket.on('order_status_update', (o) => dispatch(updateOrderRealtime(o)));

    return () => socket.disconnect();
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o =>
    (o.orderNumber?.includes(searchTerm) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.table?.tableNumber?.toString().includes(searchTerm))
    );
  }, [orders, searchTerm]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setVisibleCount((prev) => prev + 4);
    }
  };

  const handleUpdateStatus = (id, newStatus) =>
    dispatch(updateOrderStatus({ orderId: id, status: newStatus }));

  const handleShowDetail = (orderId) => setSelectedOrderId(orderId);
  const handleCloseDetail = () => setSelectedOrderId(null);

  if (rehydrating) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-lg">
        <span className="animate-pulse">Loading orders…</span>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen text-white px-4 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-black/30 border-b border-white/10 p-4 sm:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-yellow-300">
            <LayoutDashboard className="w-6 h-6" /> Cashier Dashboard
          </h1>
          <p className="text-sm text-white/60">Track and manage incoming orders</p>
        </div>
        <Button onClick={() => dispatch(logout())} className="text-white hover:text-yellow-300 text-sm">
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </Button>
      </header>

      {/* Search */}
      <section className="mt-6 max-w-7xl mx-auto">
        <div className="relative w-full mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-300 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, table or order number..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 placeholder:text-yellow-300/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          />
        </div>

        {/* Order Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh] px-1 sm:px-0"
        >
          {filteredOrders.length ? (
            filteredOrders.slice(0, visibleCount).map((order) => (
              <div
                key={order._id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform transition hover:scale-[1.015] hover:shadow-yellow-200/20"
              >
                <OrderCard
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onShowDetail={handleShowDetail} // ✅ ini penting
                />

              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-yellow-200/60">
              <Archive className="w-8 h-8 mx-auto mb-3" />
              No orders yet.
            </div>
          )}
        </div>
      </section>

      {/* 🧊 Modal Rendered Once Here */}
      {selectedOrderId && (
        <OrderDetailModal
          isOpen={!!selectedOrderId}
          orderId={selectedOrderId}
          onClose={handleCloseDetail}
        />
      )}
    </main>
  );
};

export default function CashierPage() {
  const user = useSelector(selectCurrentUser);
  return user ? <CashierDashboard /> : <LoginPage />;
}
