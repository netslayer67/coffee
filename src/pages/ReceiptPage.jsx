import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Printer, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function ReceiptPage({ order, navigateTo }) {
  const receiptRef = useRef(null);
  
  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (timestamp) => new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

  const handlePrint = () => {
    window.print();
  };
  
  const handleAction = (actionName) => {
    toast({
      title: "🚧 Fitur dalam pengembangan",
      description: `${actionName} belum diimplementasikan.`,
      duration: 3000,
    });
  };

  if (!order) {
    return (
      <div className="text-center py-20 px-6">
        <h2 className="text-2xl text-gray-400 mb-4">Struk tidak ditemukan.</h2>
        <Button onClick={() => navigateTo('customerLanding')}>Kembali ke Home</Button>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl p-8"
        ref={receiptRef}
      >
        <div className="text-center mb-8">
          <Coffee className="w-12 h-12 mx-auto text-amber-400 mb-2" />
          <h2 className="text-2xl font-bold text-white">Café Horizon</h2>
          <p className="text-gray-400">Struk Pembayaran</p>
        </div>
        
        <div className="space-y-4 border-t border-b border-dashed border-gray-600 py-4">
          <div className="flex justify-between text-gray-300"><span >Tanggal:</span> <span className="font-medium text-white">{formatDate(order.timestamp)}</span></div>
          <div className="flex justify-between text-gray-300"><span >No Pesanan:</span> <span className="font-medium text-white">{order.orderNumber}</span></div>
          <div className="flex justify-between text-gray-300"><span >Nama:</span> <span className="font-medium text-white">{order.customer.name}</span></div>
          <div className="flex justify-between text-gray-300"><span >Meja:</span> <span className="font-medium text-white">{order.customer.tableNumber}</span></div>
          <div className="flex justify-between text-gray-300"><span >Status:</span> <span className="font-bold text-amber-400 capitalize">{order.status}</span></div>
        </div>

        <div className="my-6">
          <h3 className="font-semibold text-white mb-3">Detail Pesanan:</h3>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex">
                <div className="flex-1">
                  <p className="text-white">{item.name}</p>
                  <p className="text-gray-400 text-sm">{item.quantity} x {formatPrice(item.price)}</p>
                </div>
                <p className="text-white">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-dashed border-gray-600 pt-4 space-y-2">
            <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-300"><span>Pajak (10%)</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between text-white text-xl font-bold mt-2"><span>Total</span><span className="text-amber-400">{formatPrice(order.total)}</span></div>
        </div>
        
        <div className="text-center mt-8 text-gray-400 text-sm">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Simpan struk ini sebagai bukti pembayaran.</p>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid grid-cols-3 gap-4 no-print"
      >
        <Button variant="outline" className="flex-col h-auto py-3" onClick={handlePrint}><Printer className="w-6 h-6 mb-1"/><span>Cetak</span></Button>
        <Button variant="outline" className="flex-col h-auto py-3" onClick={() => handleAction('Download')}><Download className="w-6 h-6 mb-1"/><span>Unduh</span></Button>
        <Button variant="outline" className="flex-col h-auto py-3" onClick={() => handleAction('Share')}><Share2 className="w-6 h-6 mb-1"/><span>Bagikan</span></Button>
      </motion.div>
      
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 no-print"
       >
         <Button onClick={() => navigateTo('customerLanding')} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl">
           Kembali ke Home
         </Button>
       </motion.div>
    </div>
  );
}