// src/pages/CashierPage.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListFilter, DollarSign, ShoppingBag, Clock, Search, Eye, UtensilsCrossed, CheckCircle, User, MapPin, Receipt, ArrowRight, XCircle, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectCurrentUser, selectAuthStatus, logout } from '../features/auth/authSlice';

// Komponen untuk Halaman Login
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const authStatus = useSelector(selectAuthStatus);
  const error = useSelector((state) => state.auth.error);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Cashier Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          {authStatus === 'failed' && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={authStatus === 'loading'}
          >
            {authStatus === 'loading' ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

//=================================================================
// KOMPONEN-KOMPONEN INTERNAL (Diintegrasikan dari file Anda)
//=================================================================

// --- Komponen StatCard dari CashierStats.jsx ---
const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20"
  >
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

// --- Komponen OrderCard dari OrderCard.jsx ---
const statusConfig = {
  pending: { label: 'Pending', color: 'border-yellow-500', icon: Clock },
  preparing: { label: 'Preparing', color: 'border-blue-500', icon: UtensilsCrossed },
  ready: { label: 'Ready', color: 'border-green-500', icon: CheckCircle },
  completed: { label: 'Completed', color: 'border-gray-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'border-red-500', icon: XCircle }
};

const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const OrderCard = ({ order, updateOrderStatus, viewReceipt }) => {
  const statusInfo = statusConfig[order.status] || {};
  const StatusIcon = statusInfo.icon || Clock;

  const handleStatusUpdate = (newStatus) => {
    updateOrderStatus(order.id, newStatus);
    toast({
      title: "Status Diperbarui! ✅",
      description: `Pesanan ${order.orderNumber} ditandai sebagai ${newStatus}.`,
      duration: 2000,
    });
  };

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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative bg-gray-900/50 backdrop-blur-xl border-l-4 ${statusInfo.color} border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 hover:border-amber-500/80 transition-colors duration-300`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${statusInfo.color?.replace('border', 'text')}`} />
              <span className="font-mono text-lg font-bold text-white">{order.orderNumber}</span>
            </div>
            <p className="text-sm text-gray-400 ml-9">{formatTime(order.timestamp)}</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatPrice(order.total)}</p>
        </div>
        <div className="space-y-2 bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-3"><User className="w-5 h-5 text-gray-500 flex-shrink-0" /><span className="font-medium text-white truncate">{order.customer.name}</span></div>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" /><span className="font-medium text-white">Meja {order.customer.tableNumber}</span></div>
        </div>
      </div>
      <div className="bg-black/20 p-3 flex items-center justify-end gap-2">
        <Button onClick={() => viewReceipt(order)} size="sm" variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white">
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
// KOMPONEN UTAMA - CashierPage
//=================================================================
export default function CashierPage({ orders, updateOrderStatus, viewReceipt }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Efek untuk mendeteksi ukuran layar
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Logika penyaringan pesanan dari CashierFilters.jsx
  const filteredOrders = orders.filter(order => {
    const searchMatch = searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const orderColumns = {
    pending: { title: 'Menunggu', orders: filteredOrders.filter(o => o.status === 'pending') },
    preparing: { title: 'Sedang Disiapkan', orders: filteredOrders.filter(o => o.status === 'preparing') },
    ready: { title: 'Siap Diantar', orders: filteredOrders.filter(o => o.status === 'ready') },
    completed: { title: 'Selesai', orders: filteredOrders.filter(o => o.status === 'completed') },
  };

  // --- Logika Statistik dari CashierStats.jsx ---
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.total, 0);
  const inProgressOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length;

  const statItems = [
    { title: 'Total Pendapatan', value: formatPrice(totalRevenue), icon: DollarSign, colorClass: 'bg-green-500/80' },
    { title: 'Pesanan Aktif', value: inProgressOrders, icon: Clock, colorClass: 'bg-blue-500/80' },
    { title: 'Total Pesanan Hari Ini', value: orders.length, icon: ShoppingBag, colorClass: 'bg-amber-500/80' },
    { title: 'Pesanan Selesai', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle, colorClass: 'bg-purple-500/80' },
  ];

  // --- Opsi Filter dari CashierFilters.jsx ---
  const filterOptions = [
    { value: 'all', label: 'Semua', icon: ListFilter },
    { value: 'pending', label: 'Menunggu', icon: Clock },
    { value: 'preparing', label: 'Disiapkan', icon: UtensilsCrossed },
    { value: 'ready', label: 'Siap', icon: CheckCircle },
  ];

  return (
    <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-white">Dasbor Alur Kerja Pesanan</h1>
        <p className="text-gray-400 mt-1">Kelola semua pesanan secara visual dan efisien.</p>
      </motion.div>

      {/* --- Tampilan Statistik --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statItems.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={0.1 * (index + 1)} />
        ))}
      </div>

      {/* --- Tampilan Filter --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" placeholder="Cari No Pesanan, Nama, atau Meja..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500/80" />
        </div>
        <div className="flex items-center justify-center bg-black/20 p-1 rounded-lg">
          {filterOptions.map(option => (
            <button key={option.value} onClick={() => setStatusFilter(option.value)} className={`relative px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors duration-300 ${statusFilter === option.value ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              <option.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{option.label}</span>
              {statusFilter === option.value && <motion.div layoutId="activeFilter" className="absolute inset-0 bg-amber-500/80 rounded-md -z-10" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* --- Tampilan Papan Kanban / Tab Seluler --- */}
      {isMobileView ? (
        <div className="w-full">
          <div className="flex items-center border-b border-white/10 mb-4">
            {Object.entries(orderColumns).map(([key, col]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === key ? 'text-amber-400' : 'text-gray-400'}`}>
                {col.title} ({col.orders.length})
                {activeTab === key && <motion.div layoutId="activeMobileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {orderColumns[activeTab].orders.length > 0 ? (
                orderColumns[activeTab].orders.map(order => <OrderCard key={order.id} order={order} updateOrderStatus={updateOrderStatus} viewReceipt={viewReceipt} />)
              ) : (
                <div className="text-center py-16 text-gray-500"><Archive className="w-12 h-12 mx-auto mb-2" />Tidak ada pesanan.</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(orderColumns).map(([key, col]) => (
            <div key={key} className="bg-black/20 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">{col.title} <span className="text-sm font-medium text-gray-400">({col.orders.length})</span></h2>
              <AnimatePresence>
                {col.orders.length > 0 ? (
                  <div className="space-y-4 h-[calc(100vh-450px)] overflow-y-auto pr-2">
                    {col.orders.map(order => <OrderCard key={order.id} order={order} updateOrderStatus={updateOrderStatus} viewReceipt={viewReceipt} />)}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-gray-500 py-10"><Archive className="w-12 h-12 mx-auto mb-2" />Tidak ada pesanan.</div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}