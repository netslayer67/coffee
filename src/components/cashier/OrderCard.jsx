import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle, XCircle, User, MapPin, ArrowRight,
  UtensilsCrossed, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const statusConfig = {
  pending: { label: 'Menunggu', color: 'border-yellow-500', icon: Clock },
  preparing: { label: 'Disiapkan', color: 'border-blue-500', icon: UtensilsCrossed },
  ready: { label: 'Siap', color: 'border-green-500', icon: CheckCircle },
  completed: { label: 'Selesai', color: 'border-gray-600', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'border-red-500', icon: XCircle }
};
const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });


export default function OrderCard({ order, onUpdateStatus, onViewReceipt }) {
  const statusInfo = statusConfig[order.status] || {};
  const StatusIcon = statusInfo.icon || Clock;

  // Handler ini sekarang hanya memanggil fungsi dari props
  const handleStatusUpdate = (newStatus) => {
    onUpdateStatus(order._id, newStatus);
    toast({
      title: "Status Diperbarui! ✅",
      description: `Pesanan ${order.orderNumber} ditandai sebagai ${newStatus}.`,
      duration: 2000,
    });
  };

  const getStatusAction = () => {
    switch (order.status) {
      case 'pending':
        return { label: 'Mulai Siapkan', action: () => handleStatusUpdate('preparing'), icon: ArrowRight, className: 'bg-blue-600 hover:bg-blue-500' };
      case 'preparing':
        return { label: 'Tandai Siap', action: () => handleStatusUpdate('ready'), icon: ArrowRight, className: 'bg-green-600 hover:bg-green-500' };
      case 'ready':
        return { label: 'Selesaikan', action: () => handleStatusUpdate('completed'), icon: CheckCircle, className: 'bg-purple-600 hover:bg-purple-500' };
      default:
        return null;
    }
  };
  const action = getStatusAction();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative bg-gray-900/50 backdrop-blur-xl border-l-4 ${statusInfo.color} border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 hover:border-amber-500/80 transition-colors duration-300`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${statusInfo.color?.replace('border', 'text')}`} />
              <span className="font-mono text-lg font-bold text-white">{order.orderNumber}</span>
            </div>
            <p className="text-sm text-gray-400 ml-9">{formatTime(order.createdAt)}</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatPrice(order.total)}</p>
        </div>
        <div className="space-y-2 bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-3"><User className="w-5 h-5 text-gray-500 flex-shrink-0" /><span className="font-medium text-white truncate">{order.customerName}</span></div>
          {/* Pastikan 'order.table' ada sebelum mengakses 'tableNumber' */}
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" /><span className="font-medium text-white">Meja {order.table?.tableNumber || '-'}</span></div>
        </div>
      </div>
      <div className="bg-black/20 p-3 flex items-center justify-end gap-2">
        <Button onClick={() => onViewReceipt(order)} size="sm" variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white">
          <Eye size={16} className="mr-2" /> Detail
        </Button>
        {action && (
          <Button onClick={action.action} size="sm" className={`text-white font-semibold ${action.className}`}>
            {action.label} <action.icon size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}