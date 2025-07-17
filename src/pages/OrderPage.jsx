'use client';
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, Trash2, ShoppingCart, User, Edit3, ChevronRight, Loader2
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

  const handleNavigateToPayment = () => {
    if (cart.length === 0) {
      toast({ title: 'Keranjang kosong', variant: 'destructive' });
      return;
    }

    const orderData = {
      customerName: customerSession.customerName,
      table: customerSession.tableId,
      items: cart.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal,
    };

    dispatch(createOrder(orderData))
      .unwrap()
      .then(() => navigateTo('payment'))
      .catch(err => toast({
        title: 'Gagal membuat ulang pesanan',
        description: err.message,
        variant: 'destructive'
      }));
  };

  const handleUpdateQuantity = (itemId, quantity) => dispatch(updateCartQuantity({ itemId, quantity }));
  const handleClearCart = () => dispatch(clearCart());

  if (!customerSession || !customerSession.customerName) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-300">Keranjang kosong</h3>
          <p className="text-sm text-gray-500">Mulai tambahkan menu favorit Anda.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Pelanggan */}
          <motion.div
            className="rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-emerald-400" /> Info Pelanggan
            </h2>
            <div className="space-y-1 text-sm">
              <p>Nama: <span className="font-semibold">{customerSession.customerName}</span></p>
              <p>Meja: <span className="font-semibold">{customerSession.tableNumber}</span></p>
              {currentOrder && <p>No. Pesanan: <span className="font-semibold">{currentOrder.orderNumber}</span></p>}
            </div>
            <Button onClick={() => navigateTo('customerLanding')} size="sm" variant="outline" className="mt-4">
              <Edit3 className="w-4 h-4 mr-1" /> Ubah Info
            </Button>
          </motion.div>

          {/* List Item */}
          <motion.div
            className="rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-emerald-400" />
                Pesanan ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </h3>
              <Button onClick={handleClearCart} size="sm" variant="ghost" className="text-red-400">
                <Trash2 className="w-4 h-4 mr-1.5" /> Hapus Semua
              </Button>
            </div>
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 hover:scale-[1.01] transition-transform duration-200 transform-gpu"
                    style={{ perspective: '800px' }}
                  >
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-lg" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-green-400">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} size="icon" variant="ghost">
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <Button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} size="icon" variant="ghost">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <motion.aside
          className="sticky top-24 space-y-4 rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/10 shadow-xl"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Pajak (11%)</span><span>{formatPrice(taxAmount)}</span></div>
            <div className="flex justify-between border-t pt-3 mt-2 text-base font-bold">
              <span>Total</span><span className="text-emerald-400">{formatPrice(grandTotal)}</span>
            </div>
            <Button
              onClick={handleNavigateToPayment}
              disabled={orderStatus === 'loading'}
              className="w-full mt-4 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-black font-bold py-3 rounded-xl text-sm active:scale-95 transform transition-transform"
            >
              {orderStatus === 'loading' ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Lanjutkan Pembayaran <ChevronRight className="w-5 h-5 ml-2" />
                </span>
              )}
            </Button>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
