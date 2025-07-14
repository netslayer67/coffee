import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, User, MapPin, Coffee, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const statusConfig = {
  pending: { label: 'Menunggu', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400', icon: Clock },
  preparing: { label: 'Dibuat', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400', icon: Coffee },
  ready: { label: 'Siap', bgColor: 'bg-green-500/20', textColor: 'text-green-400', icon: CheckCircle },
  completed: { label: 'Selesai', bgColor: 'bg-gray-500/20', textColor: 'text-gray-400', icon: CheckCircle },
  cancelled: { label: 'Batal', bgColor: 'bg-red-500/20', textColor: 'text-red-400', icon: XCircle }
};

const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function OrderCard({ order, index, updateOrderStatus, viewReceipt }) {
  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    const statusLabels = {
      preparing: 'sedang dibuat', ready: 'siap disajikan', completed: 'selesai', cancelled: 'dibatalkan'
    };
    toast({
      title: "Status diperbarui! ✅",
      description: `Pesanan ${statusLabels[newStatus]}`,
      duration: 3000,
    });
  };

  const getStatusActions = (order) => {
    const actions = [];
    if (order.status === 'pending') {
      actions.push(<Button key="prepare" onClick={() => handleStatusUpdate(order.id, 'preparing')} size="sm" className="bg-blue-500 hover:bg-blue-600 text-white w-full">Mulai Buat</Button>);
      actions.push(<Button key="cancel" onClick={() => handleStatusUpdate(order.id, 'cancelled')} size="sm" variant="outline" className="text-red-400 border-red-400/50 hover:bg-red-400/10 w-full">Batalkan</Button>);
    } else if (order.status === 'preparing') {
      actions.push(<Button key="ready" onClick={() => handleStatusUpdate(order.id, 'ready')} size="sm" className="bg-green-500 hover:bg-green-600 text-white w-full">Siap Sajikan</Button>);
    } else if (order.status === 'ready') {
      actions.push(<Button key="complete" onClick={() => handleStatusUpdate(order.id, 'completed')} size="sm" className="bg-gray-500 hover:bg-gray-600 text-white w-full">Selesaikan</Button>);
    }
    
    if (order.status === 'completed' || order.status === 'cancelled') {
        actions.push(<Button key="receipt" onClick={() => viewReceipt(order)} size="sm" variant="outline" className="text-amber-400 border-amber-400/50 hover:bg-amber-400/10 w-full flex items-center gap-2"><Receipt size={16}/>Lihat Struk</Button>);
    }

    return actions;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: 0.05 * index }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{order.orderNumber}</h3>
              <div className={`mt-1 px-3 py-1 rounded-full ${statusInfo.bgColor} flex items-center space-x-2 w-fit`}>
                <StatusIcon className={`w-4 h-4 ${statusInfo.textColor}`} />
                <span className={`text-sm font-medium ${statusInfo.textColor}`}>{statusInfo.label}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-400">{formatPrice(order.total)}</p>
              <p className="text-sm text-gray-400">{formatTime(order.timestamp)}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-3"><User className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-400">Pelanggan</p><p className="font-medium text-white">{order.customer.name}</p></div></div>
            <div className="flex items-center space-x-3"><MapPin className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-400">Nomor Meja</p><p className="font-medium text-white">{order.customer.tableNumber}</p></div></div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 mb-4"><h4 className="font-medium text-white mb-3">Item Pesanan:</h4><div className="space-y-2">{order.items.map((item) => (<div key={item.id} className="flex justify-between text-sm"><span className="text-gray-300">{item.quantity}x {item.name}</span><span className="text-amber-400">{formatPrice(item.price * item.quantity)}</span></div>))}</div></div>
          {order.customer.notes && (<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3"><p className="text-sm text-amber-400"><strong>Catatan:</strong> {order.customer.notes}</p></div>)}
        </div>
        <div className="flex flex-col space-y-2 min-w-[150px]">{getStatusActions(order)}</div>
      </div>
    </motion.div>
  );
}