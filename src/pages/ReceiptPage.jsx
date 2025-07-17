import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Printer, Download, Share2, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { io } from "socket.io-client";

// Impor hooks dan actions yang relevan dari Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentOrder,
  selectOrderStatus,
  fetchCustomerOrderStatus,
  updateOrderRealtime, // Action untuk pembaruan real-time
  clearCurrentOrder
} from '../features/orders/orderSlice';
import { selectCustomerSession, clearCustomerSession } from '../features/customer/customerSlice';

export default function ReceiptPage({ navigateTo }) {
  const dispatch = useDispatch();

  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderStatus);
  const customerSession = useSelector(selectCustomerSession);

  /**
   * ##################################################
   * ## LOGIKA UTAMA YANG DIPERBAIKI ADA DI FUNGSI INI ##
   * ##################################################
   */
  useEffect(() => {
    let orderIdToFetch = null;

    // Prioritaskan ID dari state Redux, jika tidak ada (karena refresh),
    // coba ambil dari sesi yang tersimpan.
    if (order && order._id) {
      orderIdToFetch = order._id;
    } else if (customerSession && customerSession.orderId) {
      orderIdToFetch = customerSession.orderId;
    }

    // Jika ada ID pesanan, ambil data terbaru dan setup listener real-time
    if (orderIdToFetch) {
      // Ambil data terbaru saat komponen dimuat (menangani refresh)
      dispatch(fetchCustomerOrderStatus(orderIdToFetch));

      // Setup koneksi Socket.IO
      const socket = io(import.meta.env.VITE_API_BASE_URL.replace("/api/v1", ""));

      socket.on('connect', () => {
        console.log(`ReceiptPage connected to socket server for order: ${orderIdToFetch}`);
      });

      // Dengarkan event pembaruan status
      const handleUpdate = (updatedOrder) => {
        if (updatedOrder._id === orderIdToFetch) {
          console.log('Real-time update received:', updatedOrder);
          dispatch(updateOrderRealtime(updatedOrder));
        }
      };

      socket.on('order_status_update', handleUpdate);
      socket.on('payment_update', handleUpdate);

      // Cleanup koneksi saat komponen unmount
      return () => {
        socket.disconnect();
      };
    }
  }, [dispatch, order?._id, customerSession?.orderId]);


  const handleBackToHome = () => {
    dispatch(clearCurrentOrder());      // Bersihkan pesanan saat ini dari Redux
    dispatch(clearCustomerSession()); // Bersihkan sesi pelanggan dari Redux & sessionStorage
    navigateTo('customerLanding');
    // Lakukan refresh untuk memastikan state benar-benar bersih untuk pelanggan berikutnya
    window.location.reload();
  };

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (timestamp) => new Date(timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const handlePrint = () => window.print();
  const handleAction = (actionName) => toast({ title: "🚧 Fitur dalam Pengembangan", description: `${actionName} belum tersedia.`, duration: 3000 });

  // Tampilan loading saat pertama kali memuat atau refresh
  if (status === 'loading' && !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-amber-400 mb-4" />
        <h2 className="text-2xl text-gray-300">Memuat Struk...</h2>
      </div>
    );
  }

  // Tampilan jika order tidak ditemukan sama sekali
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl text-gray-400 mb-4">Struk tidak ditemukan.</h2>
        <Button onClick={handleBackToHome}>Kembali ke Halaman Utama</Button>
      </div>
    );
  }

  // Tampilan utama struk
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/20"
      >
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <Coffee className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <h2 className="text-3xl font-bold text-white">Café Horizon</h2>
            <p className="text-gray-400">Terima kasih atas pesanan Anda!</p>
          </div>

          <div className="space-y-3 border-t border-b border-white/10 py-5">
            <div className="flex justify-between text-gray-300"><span>Nomor Pesanan:</span> <span className="font-medium text-white">{order.orderNumber}</span></div>
            <div className="flex justify-between text-gray-300"><span>Tanggal:</span> <span className="font-medium text-white">{formatDate(order.createdAt)}</span></div>
            <div className="flex justify-between text-gray-300"><span>Pelanggan:</span> <span className="font-medium text-white">{order.customerName}</span></div>
            <div className="flex justify-between text-gray-300"><span>Meja:</span> <span className="font-medium text-white">{order.table?.tableNumber || '-'}</span></div>
            <div className="flex justify-between text-gray-300"><span>Status:</span> <span className="font-bold text-amber-400 capitalize">{order.status}</span></div>
            <div className="flex justify-between text-gray-300">
              <span>Pembayaran:</span>
              <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="my-6">
            <h3 className="font-semibold text-white mb-3">Detail Pesanan</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.product?._id || item._id} className="flex items-center">
                  <div className="flex-1">
                    <p className="text-white">{item.product?.name || 'Item Dihapus'} <span className="text-gray-400">x{item.quantity}</span></p>
                    <p className="text-gray-400 text-sm">@{formatPrice(item.price)}</p>
                  </div>
                  <p className="text-white font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 space-y-2">
            <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-300"><span>Pajak (11%)</span><span>{formatPrice(order.taxAmount)}</span></div>
            <div className="flex justify-between text-white text-2xl font-bold mt-2">
              <span className="text-amber-400">Total Dibayar</span>
              <span className="text-amber-400">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-8 w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4 no-print"
      >
        <div className="sm:col-span-2 grid grid-cols-3 gap-4">
          <Button variant="outline" className="flex-col h-auto py-3 bg-white/10 hover:bg-white/20" onClick={handlePrint}><Printer className="w-6 h-6 mb-1" /><span>Cetak</span></Button>
          <Button variant="outline" className="flex-col h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => handleAction('Download')}><Download className="w-6 h-6 mb-1" /><span>Unduh</span></Button>
          <Button variant="outline" className="flex-col h-auto py-3 bg-white/10 hover:bg-white/20" onClick={() => handleAction('Share')}><Share2 className="w-6 h-6 mb-1" /><span>Bagikan</span></Button>
        </div>
        <Button onClick={handleBackToHome} className="w-full sm:col-span-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl text-md">
          <Home className="w-5 h-5 mr-2" /> Kembali ke Halaman Utama
        </Button>
      </motion.div>
    </div>
  );
}