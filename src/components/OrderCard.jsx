// components/OrderCard.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
    Clock,
    UtensilsCrossed,
    CheckCircle,
    XCircle,
    ArrowRight,
    Eye,
    User,
    MapPin,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderDetailModal from './OrderDetailModal';
import '../index.css';

const statusConfig = {
    pending: { label: 'Menunggu', color: 'border-yellow-500', icon: Clock },
    preparing: { label: 'Disiapkan', color: 'border-blue-500', icon: UtensilsCrossed },
    ready: { label: 'Siap', color: 'border-green-500', icon: CheckCircle },
    completed: { label: 'Selesai', color: 'border-gray-600', icon: CheckCircle },
    cancelled: { label: 'Dibatalkan', color: 'border-red-500', icon: XCircle }
};

const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);

const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });

const OrderCard = ({ order, onUpdateStatus, onViewReceipt }) => {
    const [showDetail, setShowDetail] = useState(false);
    const statusInfo = statusConfig[order.status] || {};
    const StatusIcon = statusInfo.icon || Clock;

    const getStatusAction = () => {
        switch (order.status) {
            case 'pending':
                return {
                    label: 'Mulai Siapkan',
                    action: () => onUpdateStatus(order._id, 'preparing'),
                    icon: ArrowRight,
                    className: 'bg-blue-600 hover:bg-blue-500'
                };
            case 'preparing':
                return {
                    label: 'Tandai Siap',
                    action: () => onUpdateStatus(order._id, 'ready'),
                    icon: ArrowRight,
                    className: 'bg-green-600 hover:bg-green-500'
                };
            case 'ready':
                return {
                    label: 'Selesaikan Pesanan',
                    action: () => onUpdateStatus(order._id, 'completed'),
                    icon: CheckCircle,
                    className: 'bg-purple-600 hover:bg-purple-500'
                };
            default:
                return null;
        }
    };

    const action = getStatusAction();

    return (
        <motion.article
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            role="listitem"
            aria-label={`Pesanan ${order.orderNumber}`}
            className={`bg-gray-900/50 border-l-4 ${statusInfo.color} border border-white/10 rounded-2xl p-4 shadow-xl transition-all`}
        >
            {/* Header */}
            <header className="flex justify-between items-start gap-2">
                <div>
                    <div className="flex gap-3 items-center">
                        <StatusIcon
                            className={`w-6 h-6 ${statusInfo.color?.replace('border', 'text')}`}
                            aria-hidden="true"
                        />
                        <h2 className="text-white text-lg font-bold font-mono leading-tight">
                            {order.orderNumber}
                        </h2>
                    </div>
                    <p className="text-sm text-gray-400 ml-9 mt-1">{formatTime(order.createdAt)}</p>
                </div>
                <p
                    className="text-2xl font-bold text-amber-400"
                    aria-label={`Total ${formatPrice(order.total)}`}
                >
                    {formatPrice(order.total)}
                </p>
            </header>

            {/* Customer Info */}
            <section className="mt-4 space-y-2 bg-white/5 rounded-xl p-3 text-white text-sm leading-relaxed">
                <div className="flex items-center gap-3">
                    <User className="text-gray-500 w-5 h-5" aria-hidden="true" />
                    <span className="font-medium truncate">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="text-gray-500 w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">Meja {order.table?.tableNumber}</span>
                </div>
            </section>

            {/* Actions */}
            <footer className="flex justify-end gap-2 mt-4 flex-wrap">
                <Button
                    onClick={() => setShowDetail(true)}
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    size="sm"
                >
                    <Info className="w-4 h-4 mr-1" /> Detail
                </Button>

                <OrderDetailModal
                    isOpen={showDetail}
                    onClose={() => setShowDetail(false)}
                    orderId={order._id}
                />

                {action && (
                    <Button
                        onClick={action.action}
                        className={`text-white ${action.className}`}
                        size="sm"
                        aria-label={action.label}
                    >
                        {action.label}
                        <action.icon size={16} className="ml-2" aria-hidden="true" />
                    </Button>
                )}
            </footer>
        </motion.article>
    );
};

OrderCard.propTypes = {
    order: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        orderNumber: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
        customerName: PropTypes.string.isRequired,
        table: PropTypes.shape({
            tableNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })
    }).isRequired,
    onUpdateStatus: PropTypes.func.isRequired,
    onViewReceipt: PropTypes.func.isRequired
};

export default OrderCard;
