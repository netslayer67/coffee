// src/pages/ReceiptPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Printer, Download, Share2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function ReceiptPage({ order, navigateTo }) {
  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (timestamp) => new Date(timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleAction = (actionName) => toast({ title: "🚧 Feature in Development", description: `${actionName} isn't available just yet.`, duration: 3000 });
  const handlePrint = () => window.print();

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl text-gray-400 mb-4">Receipt not found.</h2>
        <Button onClick={() => navigateTo('customerLanding')}>Back to Home</Button>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = order.total - subtotal;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/20"
      >
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <Coffee className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <h2 className="text-3xl font-bold text-white">Café Horizon</h2>
            <p className="text-gray-400">Thank you for your order!</p>
          </div>

          <div className="space-y-3 border-t border-b border-white/10 py-5">
            <div className="flex justify-between text-gray-300"><span>Order Number:</span> <span className="font-medium text-white">{order.orderNumber}</span></div>
            <div className="flex justify-between text-gray-300"><span>Date:</span> <span className="font-medium text-white">{formatDate(order.timestamp)}</span></div>
            <div className="flex justify-between text-gray-300"><span>Customer:</span> <span className="font-medium text-white">{order.customer.name}</span></div>
            <div className="flex justify-between text-gray-300"><span>Table:</span> <span className="font-medium text-white">{order.customer.tableNumber}</span></div>
            <div className="flex justify-between text-gray-300"><span>Status:</span> <span className="font-bold text-amber-400 capitalize">{order.status}</span></div>
          </div>

          <div className="my-6">
            <h3 className="font-semibold text-white mb-3">Order Details</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center">
                  <div className="flex-1">
                    <p className="text-white">{item.name} <span className="text-gray-400">x{item.quantity}</span></p>
                    <p className="text-gray-400 text-sm">@{formatPrice(item.price)}</p>
                  </div>
                  <p className="text-white font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 space-y-2">
            <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-300"><span>Tax</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between text-white text-2xl font-bold mt-2">
              <span className="text-amber-400">Total Paid</span>
              <span className="text-amber-400">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4 no-print"
      >
        <div className="sm:col-span-2 grid grid-cols-3 gap-4">
          <Button variant="outline" className="flex-col h-auto py-3 bg-white/10 hover:bg-white/20" onClick={handlePrint}><Printer className="w-6 h-6 mb-1" /><span>Print</span></Button>
          <Button variant="outline" className="flex-col h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => handleAction('Download')}><Download className="w-6 h-6 mb-1" /><span>Download</span></Button>
          <Button variant="outline" className="flex-col h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => handleAction('Share')}><Share2 className="w-6 h-6 mb-1" /><span>Share</span></Button>
        </div>
        <Button onClick={() => navigateTo('customerLanding')} className="w-full sm:col-span-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl text-md">
          <Home className="w-5 h-5 mr-2" /> Back to Home
        </Button>
      </motion.div>
    </div>
  );
}