// src/pages/OrderPage.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, Trash2, ShoppingCart,
  User, Edit3, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// 1. Impor hooks dan actions dari Redux (nama sudah disesuaikan)
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCart,
  updateCartQuantity,
  clearCart,
  selectCurrentOrder, // Ambil order yang sudah ada
  selectOrderStatus
} from '../features/orders/orderSlice';
import { selectCustomerSession } from '../features/customer/customerSlice';

const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
}).format(price);

export default function OrderPage({ navigateTo }) {
  const dispatch = useDispatch();

  // 2. Ambil semua state yang relevan dari Redux Store
  const cart = useSelector(selectCart);
  const customerSession = useSelector(selectCustomerSession);
  const currentOrder = useSelector(selectCurrentOrder); // Gunakan order yang sudah dibuat
  const orderStatus = useSelector(selectOrderStatus);

  // 3. Kalkulasi total menggunakan useMemo (tidak ada perubahan)
  const { subtotal, tax, grandTotal } = useMemo(() => {
    const sub = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxVal = sub * 0.11;
    return {
      subtotal: sub,
      tax: taxVal,
      grandTotal: sub + taxVal,
    };
  }, [cart]);

  // 4. Logika untuk membuat pesanan (tidak ada perubahan, sudah benar)
  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      toast({ title: "Keranjang Anda kosong", description: "Silakan tambahkan item terlebih dahulu.", variant: "destructive" });
      return;
    }
    if (!customerSession.customerName || !customerSession.tableId) {
      toast({ title: "Informasi Pelanggan Kurang", description: "Sesi pelanggan tidak valid. Silakan kembali ke halaman utama.", variant: "destructive" });
      navigateTo('customerLanding');
      return;
    }

    const orderData = {
      customerName: customerSession.customerName,
      table: customerSession.tableId,
      items: cart.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: subtotal,
      total: subtotal, // Total awal sebelum pajak
    };

    dispatch(createOrder(orderData))
      .unwrap()
      .then((createdOrder) => {
        toast({
          title: "Pesanan Berhasil Dibuat! 🎉",
          description: `Pesanan ${createdOrder.orderNumber} sedang disiapkan.`
        });
        navigateTo('payment');
      })
      .catch((err) => {
        toast({
          title: "Gagal Membuat Pesanan",
          description: err.message || "Terjadi kesalahan pada server.",
          variant: "destructive",
        });
      });
  };

  const handleNavigateToPayment = () => {
    // Validasi dasar, pastikan ada item di keranjang dan sesi valid
    if (cart.length === 0) {
      toast({ title: "Keranjang Anda kosong", variant: "destructive" });
      return;
    }
    if (!currentOrder) {
      toast({ title: "Pesanan tidak ditemukan", description: "Silakan kembali ke menu dan tambahkan item.", variant: "destructive" });
      return;
    }

    // Langsung arahkan ke halaman pembayaran karena pesanan sudah dibuat
    navigateTo('payment');
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    dispatch(updateCartQuantity({ itemId, quantity }));
  };

  const handleClearCart = () => {
    // Di sini kita juga bisa menambahkan logika untuk membatalkan pesanan
    // jika keranjang dikosongkan, tapi untuk sekarang kita biarkan sederhana.
    dispatch(clearCart());
  };

  // --- Sisa dari kode komponen (UI dan animasi) tidak ada perubahan ---
  const listVariants = { visible: { transition: { staggerChildren: 0.08 } }, hidden: {} };
  const itemVariants = {
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 150, damping: 20 } },
    hidden: { opacity: 0, x: -20 },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } }
  };

  const CustomerInfoCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center">
            <User className="w-5 h-5 mr-2 text-emerald-400" />
            Info Pelanggan
          </h3>
          <div className="text-sm space-y-1.5 text-neutral-300 mt-3">
            <div className="flex items-center gap-3"><span>Nama:</span><span className="text-white font-medium">{customerSession.customerName || '-'}</span></div>
            <div className="flex items-center gap-3"><span>Meja:</span><span className="text-white font-medium">{customerSession.tableNumber || '-'}</span></div>
            {/* Tampilkan Order ID jika ada */}
            {currentOrder && <div className="flex items-center gap-3"><span>No. Pesanan:</span><span className="text-white font-medium">{currentOrder.orderNumber}</span></div>}
          </div>
        </div>
        <Button onClick={() => navigateTo('customerLanding')} size="icon" variant="outline"
          className="border-white/20 text-neutral-300 bg-black/30 hover:bg-emerald-500/10 hover:text-emerald-300 transition"
          asChild
        >
          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.1 }}>
            <Edit3 className="w-4 h-4" />
          </motion.button>
        </Button>
      </div>
    </motion.div>
  );

  const PaymentSummary = ({ isSticky = false }) => (
    <motion.div
      initial={{ y: isSticky ? 100 : 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: isSticky ? 0 : 0.4, ease: "easeInOut" }}
      className={isSticky
        ? "fixed bottom-0 left-0 right-0 bg-neutral-950/90 backdrop-blur-2xl border-t border-white/10 p-4 pt-3 z-50 lg:hidden"
        : "bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl hidden lg:block"
      }
    >
      <div className="max-w-md mx-auto space-y-2 text-sm text-neutral-300">
        <div className="flex justify-between"><span>Subtotal</span><span className="text-white font-medium">{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between"><span>Pajak (11%)</span><span className="text-white font-medium">{formatPrice(tax)}</span></div>
        <div className="border-t border-dashed border-white/20 pt-3 mt-3 flex justify-between font-bold text-white text-base">
          <span>Total</span>
          <span className="text-emerald-400">{formatPrice(grandTotal)}</span>
        </div>
        <Button onClick={handleNavigateToPayment} disabled={orderStatus === 'loading' || cart.length === 0}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold py-3.5 rounded-xl text-base transition hover:scale-[1.03] disabled:opacity-50"
          asChild
        >
          <motion.button whileTap={{ scale: 0.98 }}>
            {orderStatus === 'loading'
              ? <div className="flex items-center"><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Memproses...</div>
              : <div className="flex items-center">Lanjutkan Pembayaran <ChevronRight className="w-5 h-5 ml-2" /></div>
            }
          </motion.button>
        </Button>
      </div>
    </motion.div>
  );

  // Jika tidak ada sesi pelanggan, tampilkan pesan keranjang kosong
  if (!customerSession || !customerSession.customerName) {
    return (
      <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden font-sans flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 px-4">
          <ShoppingCart className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
          <h3 className="font-medium text-neutral-400">Keranjang Anda kosong</h3>
          <p className="text-sm text-neutral-500 font-light">Mulai tambahkan menu favorit Anda.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full  text-white overflow-x-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff0a_1px,transparent_1px),linear-gradient(225deg,#ffffff0a_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="absolute top-1/2 left-1/2 -z-10 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-40 md:pb-48"
      >
        <div className="text-left mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Konfirmasi Pesanan</h1>
          <p className="text-neutral-400 text-sm sm:text-base font-light mt-1">Periksa kembali item sebelum melanjutkan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CustomerInfoCard />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl"
            >
              <div className="flex justify-between items-center p-5 border-b border-white/10">
                <h2 className="text-base font-bold text-white flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-emerald-400" />
                  Item Pesanan ({cart.reduce((acc, item) => acc + item.quantity, 0)})
                </h2>
                {cart.length > 0 && (
                  <Button onClick={handleClearCart} size="sm" variant="ghost"
                    className="text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                    asChild>
                    <motion.button whileTap={{ scale: 0.95 }}><Trash2 className="w-4 h-4 mr-1.5" /> Hapus Semua</motion.button>
                  </Button>
                )}
              </div>

              <div className="p-4">
                <AnimatePresence>
                  {cart.length > 0 ? (
                    <motion.div variants={listVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-2">
                      {cart.map(item => (
                        <motion.div key={item._id} variants={itemVariants} layout
                          className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 transition"
                        >
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">{item.name}</h4>
                            <p className="text-xs text-green-400/90 font-light">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-black/30 px-1 py-0.5 rounded-full border border-white/10">
                            <Button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} size="icon" variant="ghost" asChild>
                              <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}>
                                <Minus className="w-4 h-4" />
                              </motion.button>
                            </Button>
                            <span className="text-white font-bold text-sm w-6 text-center">{item.quantity}</span>
                            <Button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} size="icon" variant="ghost" asChild>
                              <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }}>
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 px-4">
                      <ShoppingCart className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
                      <h3 className="font-medium text-neutral-400">Keranjang Anda kosong</h3>
                      <p className="text-sm text-neutral-500 font-light">Mulai tambahkan menu favorit Anda.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          <div className="hidden lg:flex flex-col gap-6 sticky top-28">
            <PaymentSummary />
          </div>
        </div>
      </motion.div>
      <PaymentSummary isSticky />
    </div>
  );
}