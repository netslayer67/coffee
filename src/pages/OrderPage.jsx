// Refactored OrderPage.jsx based on best practices for responsiveness, accessibility, performance, and UX

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, Trash2, ShoppingCart,
  User, Edit3, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  selectCart,
  updateCartQuantity,
  clearCart,
  selectCurrentOrder,
  selectOrderStatus,
  createOrder
} from '../features/orders/orderSlice';
import { selectCustomerSession } from '../features/customer/customerSlice';

const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(price);

export default function OrderPage({ navigateTo }) {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const customerSession = useSelector(selectCustomerSession);
  const currentOrder = useSelector(selectCurrentOrder);
  const orderStatus = useSelector(selectOrderStatus);

  const { subtotal, taxAmount, grandTotal } = useMemo(() => {
    const sub = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAmountVal = sub * 0.11;
    return { subtotal: sub, taxAmount: taxAmountVal, grandTotal: sub + taxAmountVal };
  }, [cart]);

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      toast({ title: 'Keranjang Anda kosong', description: 'Tambahkan item terlebih dahulu.', variant: 'destructive' });
      return;
    }
    if (!customerSession.customerName || !customerSession.tableId) {
      toast({ title: 'Informasi Pelanggan Kurang', description: 'Kembali ke halaman utama.', variant: 'destructive' });
      navigateTo('customerLanding');
      return;
    }
    const orderData = {
      customerName: customerSession.customerName,
      table: customerSession.tableId,
      items: cart.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
      subtotal
    };
    dispatch(createOrder(orderData))
      .unwrap()
      .then((createdOrder) => {
        toast({ title: 'Pesanan Berhasil Dibuat', description: `Pesanan ${createdOrder.orderNumber} sedang disiapkan.` });
        navigateTo('payment');
      })
      .catch((err) => {
        toast({ title: 'Gagal Membuat Pesanan', description: err.message || 'Terjadi kesalahan.', variant: 'destructive' });
      });
  };

  const handleNavigateToPayment = () => {
    if (cart.length === 0 || !currentOrder) {
      toast({ title: 'Pesanan tidak ditemukan', variant: 'destructive' });
      return;
    }
    navigateTo('payment');
  };

  const handleUpdateQuantity = (itemId, quantity) => dispatch(updateCartQuantity({ itemId, quantity }));
  const handleClearCart = () => dispatch(clearCart());

  if (!customerSession || !customerSession.customerName) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
          <h3 className="font-medium text-neutral-400">Keranjang Anda kosong</h3>
          <p className="text-sm text-neutral-500">Mulai tambahkan menu favorit Anda.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto px-4 pt-8 pb-40">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Konfirmasi Pesanan</h1>
          <p className="text-neutral-400 text-sm mt-1">Periksa kembali item sebelum melanjutkan.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <motion.div className="bg-neutral-900 p-5 rounded-xl shadow">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-emerald-400" /> Info Pelanggan
              </h3>
              <div className="text-sm space-y-1">
                <div>Nama: <span className="font-medium">{customerSession.customerName}</span></div>
                <div>Meja: <span className="font-medium">{customerSession.tableNumber}</span></div>
                {currentOrder && <div>No. Pesanan: <span className="font-medium">{currentOrder.orderNumber}</span></div>}
              </div>
              <div className="mt-4">
                <Button onClick={() => navigateTo('customerLanding')} variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-1" /> Ubah Info
                </Button>
              </div>
            </motion.div>

            <motion.div className="bg-neutral-900 p-5 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-bold flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-emerald-400" />
                  Item Pesanan ({cart.reduce((acc, item) => acc + item.quantity, 0)})
                </h4>
                <Button onClick={handleClearCart} size="sm" variant="ghost" className="text-red-400">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Hapus Semua
                </Button>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-green-400">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} size="icon" variant="ghost"><Minus className="w-4 h-4" /></Button>
                        <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                        <Button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} size="icon" variant="ghost"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </section>

          <aside className="space-y-4 sticky top-24">
            <div className="bg-neutral-900 p-5 rounded-xl shadow space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (11%)</span>
                <span className="font-medium">{formatPrice(taxAmount)}</span>
              </div>
              <div className="border-t pt-3 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-emerald-400">{formatPrice(grandTotal)}</span>
              </div>
              <Button onClick={handleNavigateToPayment} disabled={orderStatus === 'loading'} className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl text-base">
                {orderStatus === 'loading'
                  ? <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</span>
                  : <span className="flex items-center">Lanjutkan Pembayaran <ChevronRight className="w-5 h-5 ml-2" /></span>
                }
              </Button>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}
