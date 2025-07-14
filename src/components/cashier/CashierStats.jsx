import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Clock, CheckCircle } from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function CashierStats({ orders }) {
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    completedOrders: orders.filter(order => order.status === 'completed').length
  };

  const statItems = [
    { title: 'Total Pesanan', value: stats.totalOrders, icon: ShoppingBag, color: 'from-blue-500 to-cyan-500' },
    { title: 'Total Pendapatan', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { title: 'Pesanan Pending', value: stats.pendingOrders, icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { title: 'Pesanan Selesai', value: stats.completedOrders, icon: CheckCircle, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={0.1 * index} />
      ))}
    </div>
  );
}