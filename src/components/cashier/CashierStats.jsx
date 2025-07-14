// src/components/cashier/CashierStats.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Clock, CheckCircle } from 'lucide-react';

const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

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

export default function CashierStats({ orders }) {
  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = orders.filter(order => ['pending', 'preparing'].includes(order.status)).length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;

  const statItems = [
    { title: 'Total Orders', value: orders.length, icon: ShoppingBag, colorClass: 'bg-amber-500/80' },
    { title: 'Revenue', value: formatPrice(totalRevenue), icon: DollarSign, colorClass: 'bg-green-500/80' },
    { title: 'In Progress', value: pendingOrders, icon: Clock, colorClass: 'bg-blue-500/80' },
    { title: 'Completed', value: completedOrders, icon: CheckCircle, colorClass: 'bg-purple-500/80' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {statItems.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={0.1 * (index + 1)} />
      ))}
    </div>
  );
}