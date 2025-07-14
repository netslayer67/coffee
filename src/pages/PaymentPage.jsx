// src/pages/PaymentPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, CreditCard, CheckCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function PaymentPage({ order, updateOrderStatus, navigateTo }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    // ... (keep existing logic) ...
    if (!selectedMethod) {
      toast({ title: "No Method Selected", description: "Please choose a payment method.", variant: "destructive", duration: 3000 });
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      // Simulate different outcomes
      if (selectedMethod === 'cashier') {
        toast({ title: "Proceed to Cashier", description: "Please show your order number at the cashier to pay.", duration: 5000 });
      } else {
        toast({ title: "Payment Successful!", description: "Thank you! Your order has been paid.", duration: 5000 });
      }

      // Update status to 'preparing' regardless of payment method
      updateOrderStatus(order.id, 'preparing');

      setIsProcessing(false);
      navigateTo('receipt');
    }, 2500);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <h2 className="text-2xl text-gray-400">Could not find your order.</h2>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'online', name: 'Credit/Debit Card', icon: CreditCard, description: 'Pay securely with your card.' },
    { id: 'qris', name: 'QRIS Payment', icon: QrCode, description: 'Scan QR code with your e-wallet.' },
    { id: 'cashier', name: 'Pay at Cashier', icon: Banknote, description: 'Pay with cash or card at the counter.' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Secure Payment
          </h1>
          <p className="text-lg text-gray-300">Choose your preferred way to complete the transaction.</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20 space-y-6">
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.03 }}
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

          <div className="border-t border-white/10 pt-6 space-y-4">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !selectedMethod}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/20 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : `Confirm & Pay ${order.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`}
            </Button>
            <Button
              onClick={() => navigateTo('receipt')}
              variant="ghost"
              className="w-full text-gray-400 hover:bg-white/10 hover:text-white"
            >
              Pay Later at Cashier
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}