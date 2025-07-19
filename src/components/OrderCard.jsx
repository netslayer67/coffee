import React from 'react';
import PropTypes from 'prop-types';
import {
    Clock, UtensilsCrossed, CheckCircle, XCircle,
    ArrowRight, User, MapPin, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusConfig = {
    pending: { label: 'Menunggu', color: 'border-yellow-400', icon: Clock },
    preparing: { label: 'Disiapkan', color: 'border-blue-400', icon: UtensilsCrossed },
    ready: { label: 'Siap', color: 'border-green-400', icon: CheckCircle },
    completed: { label: 'Selesai', color: 'border-gray-400', icon: CheckCircle },
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

const OrderCard = ({ order, onUpdateStatus, onViewReceipt, onShowDetail }) => {
    const statusInfo = statusConfig[order.status] || {};
    const StatusIcon = statusInfo.icon || Clock;

    const getStatusAction = () => {
        switch (order.status) {
            case 'pending':
                return {
                    label: 'Siapkan Pesanan',
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
                    label: 'Selesaikan',
                    action: () => onUpdateStatus(order._id, 'completed'),
                    icon: CheckCircle,
                    className: 'bg-emerald-600 hover:bg-emerald-500'
                };
            default:
                return null;
        }
    };

    const action = getStatusAction();

    return (
        <div
            className={`bg-white/5 backdrop-blur-lg border-l-4 ${statusInfo.color} border border-white/10 rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:shadow-yellow-200/20 transform transition-transform hover:scale-[1.015]`}
        >
            {/* Header */}
            <header className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color?.replace('border', 'text')}`} />
                        <h2 className="text-white font-mono font-bold text-base leading-tight">
                            #{order.orderNumber}
                        </h2>
                    </div>
                    <p className="text-xs text-white/50 ml-7">{formatTime(order.createdAt)}</p>
                </div>
                <p className="text-amber-400 text-lg font-bold">{formatPrice(order.total)}</p>
            </header>

            {/* Customer Info */}
            <div className="mt-4 space-y-2 text-sm text-white bg-white/5 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-white/40" />
                    <span className="truncate font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-white/40" />
                    <span className="truncate font-medium">Meja {order.table?.tableNumber}</span>
                </div>
            </div>

            {/* Actions */}
            <footer className="mt-5 flex flex-wrap justify-end gap-2">
                {/* Detail */}
                <Button
                    onClick={() => onShowDetail(order._id)}
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    size="sm"
                >
                    <Info className="w-4 h-4 mr-1" /> Detail
                </Button>

                {/* Status Update */}
                {action && (
                    <button
                        onClick={action.action}
                        className={`text-sm text-white px-4 py-1.5 rounded-full flex items-center gap-1 ${action.className} transition-all`}
                    >
                        {action.label}
                        <action.icon className="w-4 h-4" />
                    </button>
                )}
            </footer>
        </div>
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
    onViewReceipt: PropTypes.func.isRequired,
    onShowDetail: PropTypes.func.isRequired
};

export default OrderCard;
