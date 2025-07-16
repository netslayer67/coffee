// src/pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// 1. Impor ikon baru untuk Bank Transfer
import { Banknote, Landmark, CheckCircle, QrCode, Loader2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

import { useDispatch, useSelector } from 'react-redux';
import {
  createPaymentTransaction,
  processCashPayment,
  selectTransactionToken,
  selectPaymentStatus,
  clearPaymentState,
} from '../features/payments/paymentSlice';
import { selectCurrentOrder } from '../features/orders/orderSlice';


export default function PaymentPage({ navigateTo }) {
  const dispatch = useDispatch();
  const order = useSelector(selectCurrentOrder);
  const paymentStatus = useSelector(selectPaymentStatus);
  const transactionToken = useSelector(selectTransactionToken);

  const [selectedMethod, setSelectedMethod] = useState(null);

  // useEffect untuk memuat script Snap.js dan menangani pembayaran
  useEffect(() => {
    // Muat script Snap.js dari Midtrans
    const scriptId = 'midtrans-snap-script';
    const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = snapScriptUrl;
      script.setAttribute('data-client-key', clientKey);
      document.body.appendChild(script);
    }

    if (transactionToken) {
      // Panggil snap.pay setelah mendapatkan token
      window.snap.pay(transactionToken, {
        onSuccess: function (result) {
          toast({ title: "Pembayaran Berhasil! 🎉", description: "Terima kasih! Pesanan Anda telah dibayar." });
          navigateTo('receipt');
        },
        onPending: function (result) {
          toast({ title: "Menunggu Pembayaran", description: "Selesaikan pembayaran Anda." });
          navigateTo('receipt');
        },
        onError: function (result) {
          toast({ title: "Pembayaran Gagal", description: "Terjadi kesalahan. Silakan coba lagi.", variant: "destructive" });
          dispatch(clearPaymentState());
        },
        onClose: function () {
          dispatch(clearPaymentState());
        }
      });
    }

    return () => {
      dispatch(clearPaymentState());
    }
  }, [transactionToken, navigateTo, dispatch]);

  const handlePayment = () => {
    if (!selectedMethod) {
      toast({ title: "Pilih Metode Pembayaran", variant: "destructive" });
      return;
    }
    if (!order) {
      toast({ title: "Pesanan Tidak Ditemukan", variant: "destructive" });
      return;
    }

    if (selectedMethod === 'qris' || selectedMethod === 'bca_va') { // <-- Sesuaikan ID
      dispatch(createPaymentTransaction(order._id));
    } else if (selectedMethod === 'cashier') {
      dispatch(processCashPayment(order));
      toast({
        title: "Lanjutkan ke Kasir",
        description: "Silakan tunjukkan nomor pesanan Anda di kasir untuk membayar.",
        duration: 5000,
      });
      navigateTo('receipt');
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <PartyPopper className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl text-gray-300">Pesanan Anda telah berhasil dibuat!</h2>
        <p className="text-gray-500 mb-6">Anda akan diarahkan untuk melakukan pembayaran.</p>
        <Button onClick={() => navigateTo('customerLanding')}>Kembali ke Halaman Utama</Button>
      </div>
    );
  }

  // --- PERUBAHAN UTAMA DI SINI ---
  const paymentMethods = [
    { id: 'qris', name: 'QRIS Payment', icon: QrCode, description: 'Pindai kode QR dengan e-wallet Anda.' },
    { id: 'bca_va', name: 'BCA Virtual Account', icon: Landmark, description: 'Bayar melalui transfer bank BCA.' },
    { id: 'cashier', name: 'Bayar di Kasir', icon: Banknote, description: 'Bayar tunai atau dengan kartu di konter.' },
  ];

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(price?.toFixed(0) || 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dots-pattern">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Pembayaran Aman
          </h1>
          <p className="text-lg text-gray-300">Pilih cara yang Anda sukai untuk menyelesaikan transaksi.</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20 space-y-6">
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <motion.div
                key={method.id} whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-5 rounded-2xl flex items-center cursor-pointer transition-all duration-300 border-2 ${selectedMethod === method.id
                  ? 'bg-amber-500/10 border-amber-400'
                  : 'bg-white/10 border-transparent hover:border-white/30'
                  }`}
              >
                <method.icon className={`w-8 h-8 mr-5 text-amber-400`} />
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-white">{method.name}</h4>
                  <p className="text-sm text-gray-400">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                    <CheckCircle className="w-7 h-7 text-green-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6">
            <Button
              onClick={handlePayment}
              disabled={paymentStatus === 'loading' || !selectedMethod}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/20 disabled:opacity-50"
            >
              {paymentStatus === 'loading' ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</>
              ) : `Konfirmasi & Bayar ${formatPrice(order?.total)}`}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}