// src/pages/OrderPage.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingCart, User, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function OrderPage({ cart, updateCartItem, clearCart, addOrder, customerInfo, navigateTo }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.11; // 11% Tax
  const grandTotal = subtotal + tax;

  const handleSubmitOrder = () => {
    // ... (keep existing logic) ...
    if (cart.length === 0) {
      toast({ title: "Your cart is empty!", description: "Please add items before proceeding.", duration: 3000 });
      return;
    }
    if (!customerInfo.name || !customerInfo.tableNumber) {
      toast({ title: "Missing Information!", description: "Please go back to provide your name and table.", duration: 4000, variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      const order = {
        id: `ord_${Date.now()}`,
        items: [...cart],
        customer: { ...customerInfo },
        total: grandTotal,
        status: 'pending',
        timestamp: new Date().toISOString(),
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`
      };
      addOrder(order);
      clearCart();
      setIsProcessing(false);
      toast({ title: "Order Placed! 🎉", description: `Order ${order.orderNumber} is now being prepared.`, duration: 5000 });
      navigateTo('payment');
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-600 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 text-lg mb-8">Looks like you haven't added anything yet. <br /> Let's find something you'll love.</p>
          <Button onClick={() => navigateTo('menu')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-xl">
            Back to Menu
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Review Your Order
        </h1>
        <p className="text-lg text-gray-300">Just one final check before we get things ready for you.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center"><ShoppingCart className="w-7 h-7 mr-3 text-amber-400" /> Your Items</h2>
            <Button onClick={clearCart} variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/10 hover:text-red-300">
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {cart.map(item => (
                <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <img src="https://images.unsplash.com/photo-1511920183353-3c9ba4ceda92?q=80&w=200" alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-400">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/10 rounded-full px-2">
                    <Button onClick={() => updateCartItem(item.id, item.quantity - 1)} size="icon" variant="ghost" className="w-8 h-8 rounded-full hover:bg-white/20"><Minus className="w-4 h-4" /></Button>
                    <span className="w-8 text-center font-semibold text-white text-lg">{item.quantity}</span>
                    <Button onClick={() => updateCartItem(item.id, item.quantity + 1)} size="icon" variant="ghost" className="w-8 h-8 rounded-full hover:bg-white/20"><Plus className="w-4 h-4" /></Button>
                  </div>
                  <p className="w-28 text-right font-bold text-lg text-amber-400">{formatPrice(item.price * item.quantity)}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6 sticky top-8">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><User className="w-5 h-5 mr-3 text-amber-400" /> Customer Info</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between"><span>Name:</span> <span className="font-medium text-white">{customerInfo.name || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Table:</span> <span className="font-medium text-white">{customerInfo.tableNumber || 'N/A'}</span></div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 text-amber-400 border-amber-400/50 hover:bg-amber-400/10" onClick={() => navigateTo('customerLanding')}>Change Info</Button>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center"><CreditCard className="w-5 h-5 mr-3 text-amber-400" /> Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-300"><span>Tax (11%)</span><span>{formatPrice(tax)}</span></div>
              <div className="border-t border-white/20 pt-4 mt-2">
                <div className="flex justify-between text-xl font-bold text-white"><span>Total</span><span className="text-amber-400">{formatPrice(grandTotal)}</span></div>
              </div>
            </div>
            <Button onClick={handleSubmitOrder} disabled={isProcessing} className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/20 disabled:opacity-50">
              {isProcessing ? (
                <div className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />Processing...</div>
              ) : (<> <CreditCard className="w-5 h-5 mr-3" /> Proceed to Payment </>)}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}