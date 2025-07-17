'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Coffee, Printer, Download, Share2, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { io } from 'socket.io-client';

import {
  selectCurrentOrder,
  selectOrderStatus,
  fetchCustomerOrderStatus,
  updateOrderRealtime,
  clearCurrentOrder
} from '../features/orders/orderSlice';
import { selectCustomerSession, clearCustomerSession } from '../features/customer/customerSlice';

export default function ReceiptPage({ navigateTo }) {
  const dispatch = useDispatch();
  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderStatus);
  const customerSession = useSelector(selectCustomerSession);

  useEffect(() => {
    const orderId = order?._id || customerSession?.orderId;
    if (orderId) {
      dispatch(fetchCustomerOrderStatus(orderId));
      const socket = io(import.meta.env.VITE_API_BASE_URL.replace('/api/v1', ''));
      const handleUpdate = (updatedOrder) => {
        if (updatedOrder._id === orderId) dispatch(updateOrderRealtime(updatedOrder));
      };
      socket.on('connect', () => console.log(`Connected to socket: ${orderId}`));
      socket.on('order_status_update', handleUpdate);
      socket.on('payment_update', handleUpdate);
      return () => socket.disconnect();
    }
  }, [dispatch, order?._id, customerSession?.orderId]);

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

  const formatDate = (timestamp) => new Date(timestamp).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleBackToHome = () => {
    dispatch(clearCurrentOrder());
    dispatch(clearCustomerSession());
    navigateTo('customerLanding');
    window.location.reload();
  };

  const handleAction = (actionName) => toast({
    title: '🚧 Fitur dalam Pengembangan',
    description: `${actionName} belum tersedia.`,
    duration: 3000,
  });

  if (status === 'loading' && !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
        <h2 className="text-2xl text-gray-300">Memuat Struk...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl text-gray-400 mb-4">Struk tidak ditemukan.</h2>
        <Button onClick={handleBackToHome}>Kembali ke Halaman Utama</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:p-6 lg:p-10 text-white">
      {/* Card with glassmorphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="text-center mb-8">
          <Coffee className="w-12 h-12 text-amber-400 mx-auto mb-4 drop-shadow-md" />
          <h2 className="text-3xl font-bold">Café Horizon</h2>
          <p className="text-gray-300 mt-1">Terima kasih atas pesanan Anda!</p>
        </div>

        <div className="border-t border-b border-white/10 py-4 space-y-2 text-sm sm:text-base">
          {[
            ['Nomor Pesanan', order.orderNumber],
            ['Tanggal', formatDate(order.createdAt)],
            ['Pelanggan', order.customerName],
            ['Meja', order.table?.tableNumber || '-'],
            ['Status', <span className="text-amber-400 font-semibold capitalize">{order.status}</span>],
            ['Pembayaran', (
              <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                {order.paymentStatus}
              </span>
            )],
          ].map(([label, value], idx) => (
            <div key={idx} className="flex justify-between text-gray-300">
              <span>{label}:</span><span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Detail Pesanan</h3>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <motion.div
                key={item.product?._id || item._id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:scale-[1.015] transform transition-transform duration-200"
              >
                <div>
                  <p className="text-white">{item.product?.name || 'Item Dihapus'} <span className="text-gray-400">x{item.quantity}</span></p>
                  <p className="text-sm text-gray-400">@{formatPrice(item.price)}</p>
                </div>
                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-4 space-y-2">
          <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-gray-300"><span>Pajak (11%)</span><span>{formatPrice(order.taxAmount)}</span></div>
          <div className="flex justify-between text-xl font-bold text-amber-400 pt-2">
            <span>Total Dibayar</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </motion.div>

      {/* Button group */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 w-full max-w-lg grid grid-cols-3 sm:grid-cols-3 gap-4 no-print"
      >
        {[
          { icon: Printer, label: 'Cetak', onClick: () => window.print() },
          { icon: Download, label: 'Unduh', onClick: () => handleAction('Download') },
          { icon: Share2, label: 'Bagikan', onClick: () => handleAction('Share') },
        ].map(({ icon: Icon, label, onClick }, i) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-black/30"
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 w-full max-w-lg"
      >
        <Button
          onClick={handleBackToHome}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl text-md shadow-lg"
        >
          <Home className="w-5 h-5 mr-2" /> Kembali ke Halaman Utama
        </Button>
      </motion.div>
    </div>
  );
}
