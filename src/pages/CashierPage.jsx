import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListFilter, DollarSign, ShoppingBag, Clock, Search, Eye,
  UtensilsCrossed, CheckCircle, User, MapPin, ArrowRight,
  XCircle, Archive, Loader2, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// 1. Impor dari Redux dan Socket.IO
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectCurrentUser, selectAuthStatus, selectAuthError, logout } from '../features/auth/authSlice';
import {
  fetchOrders,
  updateOrderStatus,
  selectAllOrders,
  selectOrderStatus,
  addOrderRealtime,
  updateOrderRealtime
} from '../features/orders/orderSlice';
import { io } from "socket.io-client";

//=================================================================
// Komponen-komponen Internal yang Bersih dan Fokus
//=================================================================

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: "easeOut" }}
    className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const statusConfig = {
  pending: { label: 'Menunggu', color: 'border-yellow-500', icon: Clock },
  preparing: { label: 'Disiapkan', color: 'border-blue-500', icon: UtensilsCrossed },
  ready: { label: 'Siap', color: 'border-green-500', icon: CheckCircle },
  completed: { label: 'Selesai', color: 'border-gray-600', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'border-red-500', icon: XCircle }
};
const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const OrderCard = ({ order, onUpdateStatus, onViewReceipt }) => {
  const statusInfo = statusConfig[order.status] || {};
  const StatusIcon = statusInfo.icon || Clock;

  const handleStatusUpdate = (newStatus) => onUpdateStatus(order._id, newStatus);

  const getStatusAction = () => {
    switch (order.status) {
      case 'pending':
        return { label: 'Mulai Siapkan', action: () => handleStatusUpdate('preparing'), icon: ArrowRight, className: 'bg-blue-600 hover:bg-blue-500' };
      case 'preparing':
        return { label: 'Tandai Siap', action: () => handleStatusUpdate('ready'), icon: ArrowRight, className: 'bg-green-600 hover:bg-green-500' };
      case 'ready':
        return { label: 'Selesaikan Pesanan', action: () => handleStatusUpdate('completed'), icon: CheckCircle, className: 'bg-purple-600 hover:bg-purple-500' };
      default:
        return null;
    }
  };
  const action = getStatusAction();

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative bg-gray-900/50 backdrop-blur-xl border-l-4 ${statusInfo.color} border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 hover:border-amber-500/80 transition-colors duration-300`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${statusInfo.color?.replace('border', 'text')}`} />
              <span className="font-mono text-lg font-bold text-white">{order.orderNumber}</span>
            </div>
            <p className="text-sm text-gray-400 ml-9">{formatTime(order.createdAt)}</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatPrice(order.total)}</p>
        </div>
        <div className="space-y-2 bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-3"><User className="w-5 h-5 text-gray-500 flex-shrink-0" /><span className="font-medium text-white truncate">{order.customerName}</span></div>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" /><span className="font-medium text-white">Meja {order.table?.tableNumber}</span></div>
        </div>
      </div>
      <div className="bg-black/20 p-3 flex items-center justify-end gap-2">
        <Button onClick={() => onViewReceipt(order)} size="sm" variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white">
          <Eye size={16} className="mr-2" /> Detail
        </Button>
        {action && (
          <Button onClick={action.action} size="sm" className={`text-white font-semibold ${action.className}`}>
            {action.label} <action.icon size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

//=================================================================
// Halaman Login
//=================================================================
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Cashier Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50" required />
          </div>
          <div className="mb-6">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50" required />
          </div>
          <AnimatePresence>
            {authStatus === 'failed' && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="text-red-400 text-sm text-center mb-4">{authError}</motion.p>
            )}
          </AnimatePresence>
          <Button type="submit" className="w-full py-3 text-base font-bold bg-amber-500 hover:bg-amber-600 text-black" disabled={authStatus === 'loading'}>
            {authStatus === 'loading' ? <Loader2 className="animate-spin" /> : 'Login'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

//=================================================================
// Komponen Dasbor Utama
//=================================================================
const CashierDashboard = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const orderInitialStatus = useSelector(selectOrderStatus);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Setup Socket.IO dan ambil data awal
  useEffect(() => {
    if (orderInitialStatus === 'idle') {
      dispatch(fetchOrders());
    }

    const socket = io(import.meta.env.VITE_API_BASE_URL.replace("/api/v1", ""));

    socket.on('connect', () => console.log('Connected to socket server'));
    socket.on('new_order', (newOrder) => {
      toast({ title: "Pesanan Baru Masuk! 🔔", description: `Pesanan ${newOrder.orderNumber} dari ${newOrder.customerName}.` });
      dispatch(addOrderRealtime(newOrder));
    });
    socket.on('order_status_update', (updatedOrder) => {
      dispatch(updateOrderRealtime(updatedOrder));
    });

    return () => socket.disconnect();
  }, [dispatch, orderInitialStatus]);

  // Logika filtering dan kalkulasi menggunakan data dari Redux
  const filteredOrders = useMemo(() => orders.filter(order => {
    const searchMatch = searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table?.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    return searchMatch && statusMatch;
  }), [orders, searchTerm, statusFilter]);

  const orderColumns = useMemo(() => ({
    pending: { title: 'Menunggu', orders: filteredOrders.filter(o => o.status === 'pending') },
    preparing: { title: 'Sedang Disiapkan', orders: filteredOrders.filter(o => o.status === 'preparing') },
    ready: { title: 'Siap Diantar', orders: filteredOrders.filter(o => o.status === 'ready') },
    completed: { title: 'Selesai', orders: filteredOrders.filter(o => o.status === 'completed') },
  }), [filteredOrders]);

  const handleUpdateStatus = (orderId, status) => {
    dispatch(updateOrderStatus({ orderId, status }));
  };
  const handleViewReceipt = (order) => console.log("Viewing receipt for:", order);

  return (
    <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Dasbor Alur Kerja Pesanan</h1>
          <p className="text-gray-400 mt-1">Kelola semua pesanan secara visual dan efisien.</p>
        </div>
        <Button onClick={() => dispatch(logout())} variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10">
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Pendapatan" value={formatPrice(useMemo(() => orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.total, 0), [orders]))} icon={DollarSign} colorClass="bg-green-500/80" delay={0.1} />
        <StatCard title="Pesanan Aktif" value={useMemo(() => orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length, [orders])} icon={Clock} colorClass="bg-blue-500/80" delay={0.2} />
        <StatCard title="Total Pesanan Hari Ini" value={orders.length} icon={ShoppingBag} colorClass="bg-amber-500/80" delay={0.3} />
        <StatCard title="Pesanan Selesai" value={useMemo(() => orders.filter(o => o.status === 'completed').length, [orders])} icon={CheckCircle} colorClass="bg-purple-500/80" delay={0.4} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" placeholder="Cari No Pesanan, Nama, atau Meja..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500/80" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(orderColumns).map(([key, col]) => (
          <div key={key} className="bg-black/20 rounded-2xl p-4">
            <h2 className="text-lg font-bold text-white mb-4">{col.title} <span className="text-sm font-medium text-gray-400">({col.orders.length})</span></h2>
            <div className="space-y-4 h-[calc(100vh-450px)] overflow-y-auto pr-2">
              <AnimatePresence>
                {col.orders.length > 0 ? (
                  col.orders.map(order => <OrderCard key={order._id} order={order} onUpdateStatus={handleUpdateStatus} onViewReceipt={handleViewReceipt} />)
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-full text-center text-gray-500 py-10">
                    <Archive className="w-12 h-12 mx-auto mb-2" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


//=================================================================
// Komponen Pintu Gerbang (Wrapper)
//=================================================================
export default function CashierPage() {
  const currentUser = useSelector(selectCurrentUser);

  return currentUser ? <CashierDashboard /> : <LoginPage />;
}