'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode, Landmark, Banknote, CheckCircle, Loader2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createPaymentTransaction,
  processCashPayment,
  savePaymentMethod, // ✅ Tambahkan ini
  selectTransactionToken,
  selectPaymentStatus,
  clearPaymentState
} from '../features/payments/paymentSlice';
import {
  selectCurrentOrder,
  setCurrentOrderFromStorage
} from '../features/orders/orderSlice';
import { setPaymentMethod } from '../features/customer/customerSlice';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const paymentOptions = [
  { id: 'qris', label: 'QRIS', icon: QrCode, desc: 'Bayar dengan QR e-wallet Anda' },
  { id: 'va', label: 'BCA Virtual Account', icon: Landmark, desc: 'Transfer antar bank BCA' },
  { id: 'cashier', label: 'Bayar di Kasir', icon: Banknote, desc: 'Tunai/kartu di konter' }
];

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);

const calculateTotal = (order) => {
  const subtotal = order?.subtotal ?? (order?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0);
  const tax = Math.round(subtotal * 0.11);
  const total = order?.total ?? subtotal + tax;
  return { subtotal, tax, total };
};

export default function PaymentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector(selectCurrentOrder);
  const paymentStatus = useSelector(selectPaymentStatus);
  const transactionToken = useSelector(selectTransactionToken);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Load order dari sessionStorage
  useEffect(() => {
    if (!order) {
      const cachedOrder = sessionStorage.getItem('currentOrder');
      if (cachedOrder) {
        try {
          dispatch(setCurrentOrderFromStorage(JSON.parse(cachedOrder)));
        } catch (err) {
          console.error('❌ Gagal parse currentOrder dari sessionStorage', err);
        }
      }
    }
  }, [dispatch, order]);

  // Snap.js Midtrans
  useEffect(() => {
    const scriptId = 'midtrans-snap-script';
    const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = snapScriptUrl;
      script.setAttribute('data-client-key', clientKey);
      document.body.appendChild(script);
    }

    if (transactionToken && order) {
      window.snap.pay(transactionToken, {
        onSuccess: () => {
          toast({ title: '🎉 Pembayaran Berhasil!', description: 'Pesanan Anda telah dibayar.' });
          navigate(`/receipt/${order._id}`);
        },
        onPending: () => {
          toast({ title: 'Menunggu Pembayaran', description: 'Selesaikan pembayaran Anda.' });
          navigate(`/receipt/${order._id}`);
        },
        onError: () => {
          toast({ title: 'Gagal', description: 'Terjadi kesalahan. Silakan coba lagi.', variant: 'destructive' });
          dispatch(clearPaymentState());
        },
        onClose: () => dispatch(clearPaymentState())
      });
    }

    return () => dispatch(clearPaymentState());
  }, [transactionToken, dispatch, navigate, order]);

  // ✅ Refactor handle submit pembayaran
  const handleSubmitPayment = async () => {
    if (!selectedMethod || !order) {
      return toast({
        title: 'Lengkapi Informasi',
        description: 'Pilih metode dan pastikan pesanan tersedia.',
        variant: 'destructive'
      });
    }

    dispatch(setPaymentMethod(selectedMethod));

    if (['qris', 'va'].includes(selectedMethod)) {
      try {
        await dispatch(savePaymentMethod({ orderId: order._id, method: selectedMethod })).unwrap();
        await dispatch(createPaymentTransaction(order._id)).unwrap();
        navigate(`/receipt/${order._id}`);
        // ✅ Force reload after navigation
        setTimeout(() => window.location.reload(), 100);
      } catch (err) {
        toast({
          title: 'Gagal Memproses Pembayaran',
          description: err?.message || 'Terjadi kesalahan saat menyimpan metode pembayaran.',
          variant: 'destructive'
        });
      }
    } else if (selectedMethod === 'cashier') {
      const updatedOrder = { ...order, paymentMethod: selectedMethod };
      await dispatch(savePaymentMethod({ orderId: order._id, method: selectedMethod })).unwrap();
      await dispatch(processCashPayment(order._id)).unwrap();
      dispatch(processCashPayment(updatedOrder));
      toast({ title: 'Bayar di Kasir', description: 'Tunjukkan nomor pesanan Anda.' });
      navigate(`/receipt/${order._id}`);
      // ✅ Force reload after navigation
      setTimeout(() => window.location.reload(), 100);
    }

  };

  const { total } = calculateTotal(order);
  const formattedTotal = formatIDR(total);

  return (
    <div className="min-h-screen text-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-10">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-transparent bg-clip-text tracking-tight">
            Metode Pembayaran
          </h1>
          <p className="mt-2 text-sm text-gray-400">Pilih metode pembayaran Anda dengan aman dan nyaman.</p>
        </div>

        <div className="rounded-3xl p-6 sm:p-10 bg-white/10 backdrop-blur-lg shadow-[0_15px_60px_rgba(255,255,255,0.05)] border border-white/10 space-y-8 transition-all">
          <div className="grid gap-4">
            {paymentOptions.map(({ id, label, icon: Icon, desc }) => (
              <div
                key={id}
                onClick={() => setSelectedMethod(id)}
                className={`group cursor-pointer flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border relative overflow-hidden
                  ${selectedMethod === id
                    ? 'bg-amber-400/10 border-amber-400'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
              >
                <div className="w-10 h-10 flex items-center justify-center text-amber-400 group-hover:rotate-6 transition-transform duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium">{label}</p>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
                {selectedMethod === id && <CheckCircle className="w-6 h-6 text-green-400" />}
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 via-white/0 to-transparent rotate-45 group-hover:animate-tilt-glow pointer-events-none" />
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400">Total Bayar</p>
            <p className="text-3xl font-semibold text-amber-400 mt-1">{formattedTotal}</p>

            {total <= 0 && (
              <p className="text-sm text-red-400 mt-2">⚠️ Total pembayaran tidak valid.</p>
            )}

            <Button
              onClick={handleSubmitPayment}
              disabled={paymentStatus === 'loading' || !selectedMethod || total <= 0}
              className="mt-6 w-full py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold 
                transition-all duration-300 
                bg-gradient-to-r from-amber-500 to-orange-500 
                hover:from-amber-600 hover:to-orange-600 
                active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-amber-400/50 
                shadow-lg shadow-orange-500/20"
            >
              {paymentStatus === 'loading' ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...</>
              ) : (
                <>Bayar Sekarang <span className="ml-1">{formattedTotal}</span></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
