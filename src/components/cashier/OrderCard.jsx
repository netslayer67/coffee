// src/components/cashier/OrderCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, User, MapPin, Coffee, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'border-yellow-500', icon: Clock },
  preparing: { label: 'Preparing', color: 'border-blue-500', icon: Coffee },
  ready: { label: 'Ready', color: 'border-green-500', icon: CheckCircle },
  completed: { label: 'Completed', color: 'border-gray-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'border-red-500', icon: XCircle }
};

const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function OrderCard({ order, index, updateOrderStatus, viewReceipt }) {
  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;

  const handleStatusUpdate = (newStatus) => {
    updateOrderStatus(order.id, newStatus);
    toast({
      title: "Status Updated! ✅",
      description: `Order ${order.orderNumber} marked as ${newStatus}.`,
      duration: 2000,
    });
  };

  const getStatusAction = () => {
    switch (order.status) {
      case 'pending':
        return { label: 'Start Preparing', action: () => handleStatusUpdate('preparing'), icon: ArrowRight, className: 'bg-blue-600 hover:bg-blue-500' };
      case 'preparing':
        return { label: 'Mark as Ready', action: () => handleStatusUpdate('ready'), icon: ArrowRight, className: 'bg-green-600 hover:bg-green-500' };
      case 'ready':
        return { label: 'Complete Order', action: () => handleStatusUpdate('completed'), icon: CheckCircle, className: 'bg-purple-600 hover:bg-purple-500' };
      default:
        return null;
    }
  };
  const action = getStatusAction();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: 0.05 * index, type: 'spring', stiffness: 300, damping: 30 }}
      className={`relative bg-gray-900/50 backdrop-blur-xl border-l-4 ${statusInfo.color} border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 hover:border-amber-500/80 transition-colors duration-300`}
    >
      <div className="p-6">
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${statusInfo.color.replace('border', 'text')}`} />
              <span className="font-mono text-lg font-bold text-white">{order.orderNumber}</span>
            </div>
            <p className="text-sm text-gray-400 ml-9">{formatTime(order.timestamp)}</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatPrice(order.total)}</p>
        </div>

        {/* Customer & Items */}
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-sm text-gray-400 mb-2">Customer Info</h4>
            <div className="flex items-center gap-3 mb-2"><User className="w-5 h-5 text-gray-500" /><span className="font-medium text-white">{order.customer.name}</span></div>
            <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-500" /><span className="font-medium text-white">Table {order.customer.tableNumber}</span></div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-sm text-gray-400 mb-2">Order Summary ({order.items.length} items)</h4>
            <div className="space-y-1 text-sm">
              {order.items.slice(0, 2).map(item => (
                <p key={item.id} className="text-gray-300 truncate">{item.quantity}x {item.name}</p>
              ))}
              {order.items.length > 2 && <p className="text-gray-400 text-xs">+ {order.items.length - 2} more...</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="bg-black/20 p-4 flex items-center justify-end gap-3">
        <Button onClick={() => viewReceipt(order)} size="sm" variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white">
          <Receipt size={16} className="mr-2" /> View Details
        </Button>
        {action && (
          <Button onClick={action.action} size="sm" className={`text-white font-semibold ${action.className}`}>
            {action.label} <action.icon size={16} className="ml-2" />
          </Button>
        )}
        {order.status === 'pending' && (
          <Button onClick={() => handleStatusUpdate('cancelled')} size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10">
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}