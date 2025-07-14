// src/components/cashier/OrderList.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderCard from '@/components/cashier/OrderCard';
import { Archive } from 'lucide-react';

export default function OrderList({ orders, updateOrderStatus, viewReceipt }) {
  return (
    <div className="space-y-6">
      <AnimatePresence>
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Archive className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No Orders Found</h3>
            <p className="text-gray-400">Orders matching your filters will appear here.</p>
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