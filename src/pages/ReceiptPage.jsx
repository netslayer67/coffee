// src/pages/ReceiptPage.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Printer, Download, Share2, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// 1. Impor hooks dan actions dari Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentOrder,
  selectOrderStatus,
  fetchCustomerOrderStatus
} from '../features/orders/orderSlice';
import { selectCustomerSession, clearCustomerSession } from '../features/customer/customerSlice'; // Untuk membersihkan sesi setelah selesai

export default function ReceiptPage({ navigateTo }) { // Hapus prop 'order'
  const dispatch = useDispatch();

  // 2. Ambil state yang relevan dari Redux store
  const order = useSelector(selectCurrentOrder);
  const status = useSelector(selectOrderStatus);
  const customerSession = useSelector(selectCustomerSession); //

  // 3. Ambil data pesanan terbaru dari backend saat halaman dimuat
  useEffect(() => {
    // Jika ada order di state, kita fetch status terbarunya untuk memastikan data sinkron
    if (order && order._id) {
      dispatch(fetchCustomerOrderStatus(order._id));
    }
  }, [dispatch, order?._id]); // Jalankan efek ini jika order._id berubah
  const getDisplayPaymentStatus = () => {
    const paymentMethodMap = {
      'bca_va': 'BCA Virtual Account',
      'qris': 'QRIS'
    };

    // Jika metode pembayaran online dipilih, langsung tampilkan berhasil
    if (customerSession?.paymentMethod && (customerSession.paymentMethod === 'bca_va' || customerSession.paymentMethod === 'qris')) {
      const methodName = paymentMethodMap[customerSession.paymentMethod] || 'Online';
      return {
        text: `Pembayaran Berhasil Menggunakan ${methodName}`,
        className: 'text-green-400'
      };
    }

    // Fallback ke status dari database
    return {
      text: order?.paymentStatus || 'Pending',
      className: order?.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'
    };
  };

  const paymentInfo = getDisplayPaymentStatus();

  const handleBackToHome = () => {
    dispatch(clearCustomerSession()); // Bersihkan sesi pelanggan saat kembali ke home
    navigateTo('customerLanding');
  };

  // --- Fungsi utilitas (tidak ada perubahan) ---
  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (timestamp) => new Date(timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const handleAction = (actionName) => toast({ title: "🚧 Fitur dalam Pengembangan", description: `${actionName} belum tersedia.`, duration: 3000 });
  const handlePrint = () => window.print();

  // 4. Tampilkan loading spinner atau pesan jika data tidak ada
  if (status === 'loading') {
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
            <p className="text-gray-400">Terima kasih atas pesanan Anda!</p>
          </div>

          {/* 5. Tampilkan data dari 'order' state Redux */}
          <div className="space-y-3 border-t border-b border-white/10 py-5">
            <div className="flex justify-between text-gray-300"><span>Nomor Pesanan:</span> <span className="font-medium text-white">{order.orderNumber}</span></div>
            <div className="flex justify-between text-gray-300"><span>Tanggal:</span> <span className="font-medium text-white">{formatDate(order.createdAt)}</span></div>
            <div className="flex justify-between text-gray-300"><span>Pelanggan:</span> <span className="font-medium text-white">{order.customerName}</span></div>
            <div className="flex justify-between text-gray-300"><span>Meja:</span> <span className="font-medium text-white">{order.table?.tableNumber || '-'}</span></div>
            <div className="flex justify-between text-gray-300"><span>Status:</span> <span className="font-bold text-amber-400 capitalize">{order.status}</span></div>
            <div className="flex justify-between text-gray-300"><span>Pembayaran:</span> <span className={`font-bold text-green-400 capitalize ${paymentInfo.className}`}>{paymentInfo.text}</span></div>
          </div>

          <div className="my-6">
            <h3 className="font-semibold text-white mb-3">Detail Pesanan</h3>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.product._id} className="flex items-center">
                  <div className="flex-1">
                    <p className="text-white">{item.product.name} <span className="text-gray-400">x{item.quantity}</span></p>
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

      {/* ... (bagian tombol aksi tidak ada perubahan, kecuali onClick untuk kembali ke home) ... */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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