import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CashierStats from '@/components/cashier/CashierStats';
import CashierFilters from '@/components/cashier/CashierFilters';
import OrderList from '@/components/cashier/OrderList';

export default function CashierPage({ orders, updateOrderStatus, viewReceipt }) {
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    let newFilteredOrders = orders;
    
    if (statusFilter !== 'all') {
      newFilteredOrders = newFilteredOrders.filter(order => order.status === statusFilter);
    }
    
    if (searchTerm) {
      newFilteredOrders = newFilteredOrders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOrders(newFilteredOrders);
  }, [orders, statusFilter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Dashboard Kasir
        </h1>
        <p className="text-gray-300">Kelola pesanan dan pantau penjualan secara real-time</p>
      </motion.div>

      <CashierStats orders={orders} />
      
      <CashierFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
      />

      <OrderList 
        orders={filteredOrders} 
        updateOrderStatus={updateOrderStatus} 
        viewReceipt={viewReceipt} 
      />
    </div>
  );
}