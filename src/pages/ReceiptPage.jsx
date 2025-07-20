/*
  ✅ Premium Redesign for ReceiptPage.jsx
  ✨ Mobile-first, glassmorphism, luxury styling, 3D native animations
  🎯 Focus: Polished layout, improved payment section, clean UI
*/

'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Printer, Download, Share2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { io } from 'socket.io-client';
import {
  selectCurrentOrder,
  selectOrderStatus,
  fetchCustomerOrderStatus,
  updateOrderRealtime,
} from '../features/orders/orderSlice';
import {
  selectCustomerSession,
  clearCustomerSession,
} from '../features/customer/customerSlice';

const ReceiptPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderStatus);
  const [isExiting, setIsExiting] = useState(false);
  const customerSession = JSON.parse(sessionStorage.getItem('customerSession') || '{}');
  const paymentMethod = customerSession?.paymentMethod;
  const isStandaloneReceipt = /^\/receipt\/[^/]+\/[^/]+$/.test(location.pathname);

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (timestamp) =>
    new Date(timestamp).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const renderPaymentStatus = () => {
    if (paymentMethod === 'va') return <span className="text-emerald-400 font-semibold">Dibayar via Virtual Account</span>;
    if (paymentMethod === 'qris') return <span className="text-emerald-400 font-semibold">Dibayar via QRIS</span>;
    if (paymentMethod === 'cashier') {
      return (
        <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {order.paymentStatus === 'paid'
            ? 'Tunai telah diterima - Terima kasih!'
            : 'Harap bayar tunai langsung di kasir'}
        </span>
      );
    }
    return <span className={`capitalize font-semibold ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>{order.paymentStatus}</span>;
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/receipt/${order.customerName}/${orderId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Disalin', description: 'Struk berhasil disalin ke clipboard.' });
  };

  const handleBackToHome = () => {
    setIsExiting(true);
    setTimeout(() => {
      dispatch(clearCustomerSession());
      navigate('/');
      window.location.reload();
    }, 500);
  };

  useEffect(() => {
    if (orderId && (!order || order._id !== orderId)) {
      dispatch(fetchCustomerOrderStatus(orderId));
    }
  }, [orderId, order]);

  useEffect(() => {
    if (!orderId) return;
    const socket = io(import.meta.env.VITE_API_BASE_URL.replace('/api/v1', ''));
    const handleUpdate = (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        dispatch(updateOrderRealtime(updatedOrder));
      }
    };
    socket.on('order_status_update', handleUpdate);
    socket.on('payment_update', handleUpdate);
    return () => socket.disconnect();
  }, [orderId]);


  if (status === 'loading' && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div className="text-white text-lg animate-pulse">Memuat struk Anda...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <p className="text-gray-400 text-lg mb-4">Struk tidak ditemukan.</p>
        <Button onClick={handleBackToHome}>Kembali ke Halaman Utama</Button>
      </div>
    );
  }

  const summaryInfo = [
    ['Nomor Pesanan', order.orderNumber],
    ['Tanggal', formatDate(order.createdAt)],
    ['Pelanggan', order.customerName],
    ['Meja', order.table?.tableNumber || '-'],
    ['Status', <span className="text-yellow-400 font-medium capitalize">{order.status}</span>],
    ['Pembayaran', renderPaymentStatus()]
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-10 text-white"
    >
      <motion.div
        initial={{ opacity: 0, rotateY: -10 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          <Coffee className="w-10 h-10 text-amber-400 mb-2 mx-auto" />
          <h1 className="text-2xl font-bold">Café Horizon</h1>
          <p className="text-gray-300 text-sm">All set! Here’s your receipt.</p>
        </div>

        <div className="space-y-1 text-sm border-y border-white/10 py-3">
          {summaryInfo.map(([label, value]) => (
            <div key={label} className="flex justify-between text-gray-300">
              <span>{label}</span><span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="font-semibold mb-2 text-base">Detail Pesanan</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <motion.div
                key={`${item.product?._id || item._id}-${i}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex justify-between items-center bg-white/5 p-3 rounded-xl hover:scale-[1.015] transition-transform"
              >
                <div>
                  <p className="text-sm">{item.product?.name || 'Item Dihapus'} <span className="text-gray-400">x{item.quantity}</span></p>
                  <p className="text-xs text-gray-400">@{formatPrice(item.price)}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {order.description && (
          <div className="mt-5">
            <h4 className="text-sm font-medium text-white mb-1">Catatan Pelanggan</h4>
            <div className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl whitespace-pre-wrap">{order.description}</div>
          </div>
        )}

        <div className="border-t border-white/10 mt-6 pt-3 text-sm space-y-1">
          <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-gray-300"><span>Pajak (11%)</span><span>{formatPrice(order.taxAmount)}</span></div>
          <div className="flex justify-between text-lg font-semibold text-amber-400 pt-2"><span>Total Dibayar</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 w-full max-w-md grid grid-cols-3 gap-3"
      >
        {[{ icon: Printer, label: 'Cetak', onClick: () => window.print() },
        { icon: Download, label: 'Salin Link', onClick: handleCopyLink },
        { icon: Share2, label: 'Bagikan', onClick: handleCopyLink },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl p-3 text-sm shadow transition-transform duration-200 active:scale-95"
          >
            <Icon className="w-5 h-5 mb-1" /><span>{label}</span>
          </button>
        ))}
      </motion.div>

      {!isStandaloneReceipt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 w-full max-w-md"
        >
          <Button
            onClick={handleBackToHome}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-semibold py-3 rounded-xl text-sm sm:text-base shadow-lg"
          >
            <Home className="w-4 h-4 mr-2" /> Kembali ke Beranda
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReceiptPage;