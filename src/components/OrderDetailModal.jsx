// components/OrderDetailModal.jsx
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCustomerOrderStatus,
    selectCurrentOrder,
    selectOrderStatus,
    selectOrderError
} from '@/features/orders/orderSlice';

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
    const dispatch = useDispatch();
    const order = useSelector(selectCurrentOrder);
    const status = useSelector(selectOrderStatus);
    const error = useSelector(selectOrderError);

    useEffect(() => {
        if (isOpen && orderId) {
            dispatch(fetchCustomerOrderStatus(orderId));
        }
    }, [isOpen, orderId, dispatch]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        className="bg-gray-900 text-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 relative overflow-y-auto max-h-[90vh]"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            aria-label="Tutup detail pesanan"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold mb-4">Detail Pesanan</h2>

                        {status === 'loading' ? (
                            <p className="text-gray-400">Memuat data pesanan...</p>
                        ) : error ? (
                            <p className="text-red-400">{error}</p>
                        ) : order ? (
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-gray-400 font-medium">Nomor Pesanan</p>
                                    <p className="text-lg font-semibold">#{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium">Status</p>
                                    <p className="capitalize font-semibold">{order.status}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium">Pelanggan</p>
                                    <p>{order.customerName || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium">Meja</p>
                                    <p>{order.table?.tableNumber || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium">Item Pesanan</p>
                                    {order.items?.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1">
                                            {order.items.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.quantity}x {item.productName || item.product?.name} - Rp{item.price.toLocaleString('id-ID')}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">Tidak ada item.</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium">Total</p>
                                    <p className="text-amber-400 font-bold text-lg">Rp{order.total.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

OrderDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    orderId: PropTypes.string.isRequired
};

export default OrderDetailModal;
