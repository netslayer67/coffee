import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, CreditCard, CheckCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function PaymentPage({ order, updateOrderStatus, navigateTo }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (!selectedMethod) {
      toast({
        title: "Pilih Metode Pembayaran",
        description: "Anda harus memilih salah satu metode pembayaran.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      if (selectedMethod === 'cashier') {
        toast({
          title: "Silakan Bayar di Kasir",
          description: "Tunjukkan nomor pesanan Anda di kasir untuk menyelesaikan pembayaran.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Pembayaran Berhasil!",
          description: "Terima kasih! Pesanan Anda telah dibayar.",
          duration: 5000,
        });
      }
      
      // We don't mark as completed here, only cashier can do that.
      // But we can move it to 'preparing' if it was pending
      if (order.status === 'pending') {
          updateOrderStatus(order.id, 'preparing');
      }

      setIsProcessing(false);
      navigateTo('receipt');
    }, 2500);
  };

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-gray-400">Pesanan tidak ditemukan.</h2>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'online', name: 'Online Transfer', icon: CreditCard, description: 'Bayar sekarang via transfer bank atau e-wallet.' },
    { id: 'qris', name: 'QRIS', icon: QrCode, description: 'Scan kode QR untuk membayar.' },
    { id: 'cashier', name: 'Bayar di Kasir', icon: Banknote, description: 'Bayar tunai atau kartu di meja kasir.' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Pembayaran
        </h1>
        <p className="text-lg text-gray-300">
          Pilih metode pembayaran yang paling nyaman untuk Anda.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6"
      >
        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-4">Pilih Metode Pembayaran</h3>
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-6 rounded-2xl flex items-center cursor-pointer transition-all duration-300 border-2 ${
                  selectedMethod === method.id
                    ? 'bg-amber-500/20 border-amber-400'
                    : 'bg-white/10 border-white/20 hover:border-white/40'
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl mr-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white`}>
                  <method.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-white">{method.name}</h4>
                  <p className="text-sm text-gray-300">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/20 pt-6">
           <Button
              onClick={() => navigateTo('receipt')}
              variant="outline"
              className="w-full mb-4 text-amber-400 border-amber-400/50 hover:bg-amber-400/10"
            >
              Bayar Nanti
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Memproses...
                </div>
              ) : `Konfirmasi Pembayaran`
              }
            </Button>
        </div>
      </motion.div>
    </div>
  );
}