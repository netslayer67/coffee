import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderCard from '@/components/cashier/OrderCard';

export default function OrderList({ orders, updateOrderStatus, viewReceipt }) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Tidak ada pesanan</h3>
            <p className="text-gray-400">Pesanan akan muncul di sini setelah pelanggan memesan</p>
          </motion.div>
        ) : (
          orders.map((order, index) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              index={index}
              updateOrderStatus={updateOrderStatus}
              viewReceipt={viewReceipt}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}