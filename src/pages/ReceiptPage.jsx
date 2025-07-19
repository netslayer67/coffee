'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
} from '../features/orders/orderSlice';
import { clearCustomerSession } from '../features/customer/customerSlice';

const ReceiptPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderStatus);
  const [isExiting, setIsExiting] = useState(false);

  const isStandaloneReceipt = /^\/receipt\/[^/]+\/[^/]+$/.test(location.pathname);

  // Format helpers
  const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

  const formatDate = (timestamp) => new Date(timestamp).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const handleBackToHome = () => {
    setIsExiting(true);
    setTimeout(() => {
      dispatch(clearCustomerSession());
      navigate('/');
      window.location.reload();
    }, 500);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/receipt/${order.customerName}/${orderId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link disalin', description: 'Kamu bisa buka struk ini kapan saja.' });
  };

  useEffect(() => {
    if (orderId && (!order || order._id !== orderId)) {
      dispatch(fetchCustomerOrderStatus(orderId));
    }
  }, [orderId, order, dispatch]);

  useEffect(() => {
    if (!orderId) return;
    const socket = io(import.meta.env.VITE_API_BASE_URL.replace('/api/v1', ''));
    const handleUpdate = (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        dispatch(updateOrderRealtime(updatedOrder));
      }
    };
    socket.on('connect', () => console.log(`Socket connected for order: ${orderId}`));
    socket.on('order_status_update', handleUpdate);
    socket.on('payment_update', handleUpdate);
    return () => socket.disconnect();
  }, [dispatch, orderId]);

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

  const summaryInfo = [
    ['Nomor Pesanan', order.orderNumber],
    ['Tanggal', formatDate(order.createdAt)],
    ['Pelanggan', order.customerName],
    ['Meja', order.table?.tableNumber || '-'],
    ['Status', (
      <span className="text-amber-400 font-semibold capitalize">{order.status}</span>
    )],
    ['Pembayaran', (
      <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
        {order.paymentStatus}
      </span>
    )],
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10 text-white"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Coffee className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto mb-3 drop-shadow-md" />
          <h2 className="text-2xl sm:text-3xl font-bold">Café Horizon</h2>
          <p className="text-gray-300 text-sm sm:text-base mt-1">Terima kasih atas pesanan Anda!</p>
        </div>

        {/* Order Summary */}
        <div className="border-t border-b border-white/10 py-3 sm:py-4 space-y-1 text-xs sm:text-sm">
          {summaryInfo.map(([label, value], i) => (
            <div key={label} className="flex justify-between text-gray-300">
              <span>{label}:</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="mt-5">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Detail Pesanan</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <motion.div
                key={`${item.product?._id || item._id}-${i}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-xl hover:scale-[1.015] transition-transform"
              >
                <div>
                  <p className="text-white text-sm sm:text-base">
                    {item.product?.name || 'Item Dihapus'} <span className="text-gray-400">x{item.quantity}</span>
                  </p>
                  <p className="text-xs text-gray-400">@{formatPrice(item.price)}</p>
                </div>
                <p className="text-sm sm:text-base font-medium">{formatPrice(item.price * item.quantity)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Optional Note */}
        {order.description && (
          <div className="mt-5">
            <h3 className="font-semibold mb-2 text-white text-sm sm:text-base">Catatan Pelanggan</h3>
            <div className="bg-white/5 p-3 rounded-xl text-gray-300 text-xs sm:text-sm leading-normal break-words whitespace-pre-wrap">
              {order.description}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-white/10 mt-5 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Pajak (11%)</span><span>{formatPrice(order.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-amber-400 pt-2">
            <span>Total Dibayar</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </motion.div>

      {/* Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 w-full max-w-md grid grid-cols-3 gap-3 sm:gap-4 no-print"
      >
        <p className="text-xs text-center text-gray-400 col-span-3">
          Note: Jangan lupa salin link-nya ya, biar struknya nggak hilang 😄
        </p>
        {[
          { icon: Printer, label: 'Cetak', onClick: () => window.print() },
          { icon: Download, label: 'Salin Link', onClick: handleCopyLink },
          { icon: Share2, label: 'Bagikan', onClick: handleCopyLink },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all duration-200 active:scale-95 shadow"
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs sm:text-sm">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* Home Button */}
      {!isStandaloneReceipt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 w-full max-w-md"
        >
          <Button
            onClick={handleBackToHome}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl text-sm sm:text-base shadow-md"
          >
            <Home className="w-4 h-4 mr-2" /> Kembali ke Halaman Utama
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReceiptPage;
