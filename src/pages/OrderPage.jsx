
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function OrderPage({ cart, updateCartItem, clearCart, addOrder, customerInfo, navigateTo }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateTotal() * 0.1; // 10% tax
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax();
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang kosong! 🛒",
        description: "Silakan tambahkan item ke keranjang terlebih dahulu",
        duration: 3000,
      });
      return;
    }

    if (!customerInfo.name || !customerInfo.tableNumber) {
      toast({
        title: "Informasi tidak lengkap! ⚠️",
        description: "Silakan kembali ke halaman utama untuk mengisi nama dan nomor meja.",
        duration: 4000,
      });
      return;
    }

    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      const order = {
        id: Date.now(),
        items: [...cart],
        customer: { ...customerInfo },
        total: calculateGrandTotal(),
        timestamp: new Date().toISOString(),
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`
      };

      addOrder(order);
      clearCart();
      setIsProcessing(false);

      toast({
        title: "Pesanan berhasil dibuat! 🎉",
        description: `Pesanan ${order.orderNumber} sedang disiapkan.`,
        duration: 5000,
      });
      
      navigateTo('payment');
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Keranjang Kosong</h2>
          <p className="text-gray-400 text-lg mb-8">Silakan pilih menu favorit Anda terlebih dahulu</p>
          <Button onClick={() => navigateTo('menu')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl">
            Lihat Menu
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Konfirmasi Pesanan
        </h1>
        <p className="text-gray-300">Periksa pesanan Anda sebelum melanjutkan</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <ShoppingCart className="w-6 h-6 mr-3 text-amber-400" />
                Keranjang Belanja
              </h2>
              <Button
                onClick={clearCart}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-400/50 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Kosongkan
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                         <img  class="w-full h-full object-cover rounded-xl" alt={item.name} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-400">{formatPrice(item.price)}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0 border-white/20 hover:bg-white/10"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-semibold text-white">
                          {item.quantity}
                        </span>
                        
                        <Button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0 border-white/20 hover:bg-white/10"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-amber-400">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Order Summary & Customer Info */}
        <div className="space-y-6">
           <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-3 text-amber-400" />
              Informasi Pelanggan
            </h3>
            <div className="space-y-2 text-gray-300">
                <div className="flex justify-between"><span>Nama:</span> <span className="font-medium text-white">{customerInfo.name || 'Belum diisi'}</span></div>
                <div className="flex justify-between"><span>No Meja:</span> <span className="font-medium text-white">{customerInfo.tableNumber || 'Belum diisi'}</span></div>
            </div>
             <Button variant="outline" size="sm" className="w-full mt-4 text-amber-400 border-amber-400/50 hover:bg-amber-400/10" onClick={() => navigateTo('customerLanding')}>
                Ubah Info
             </Button>
           </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-3 text-amber-400" />
              Ringkasan Pesanan
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              
              <div className="flex justify-between text-gray-300">
                <span>Pajak (10%)</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-amber-400">{formatPrice(calculateGrandTotal())}</span>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-400 mt-4">
                <Clock className="w-4 h-4 mr-2" />
                <span>Estimasi waktu: 10-15 menit</span>
              </div>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={isProcessing}
              className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Memproses...
                </div>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-3" />
                  Lanjut ke Pembayaran
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}