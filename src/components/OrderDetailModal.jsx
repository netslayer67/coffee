'use client';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCustomerOrderStatus,
    selectCurrentOrder,
    selectOrderStatus,
    selectOrderError,
    markOrderAsPaid // ✅ Tambahkan thunk ini
} from '@/features/orders/orderSlice';
import { toast } from '@/components/ui/use-toast';

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

    const handleMarkAsPaid = async () => {
        try {
            await dispatch(markOrderAsPaid(order._id)).unwrap();
            toast({ title: 'Pembayaran dicatat', description: 'Pesanan ditandai sebagai sudah dibayar.' });
        } catch (err) {
            toast({ title: 'Gagal', description: err || 'Gagal mengubah status pembayaran.', variant: 'destructive' });
        }
    };

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
                        className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl w-[90%] max-w-md mx-auto text-white shadow-2xl relative"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                            aria-label="Tutup detail pesanan"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-semibold text-amber-400 mb-4">
                            Detail Pesanan
                        </h2>

                        {status === 'loading' ? (
                            <p className="text-sm text-white/60">Memuat data pesanan...</p>
                        ) : error ? (
                            <p className="text-sm text-red-400">{error}</p>
                        ) : order ? (
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-white/60">Nomor Pesanan</p>
                                    <p className="text-base font-mono font-semibold text-white">#{order.orderNumber}</p>
                                </div>

                                <div>
                                    <p className="text-white/60">Status</p>
                                    <p className="capitalize font-semibold text-white">{order.status}</p>
                                </div>

                                <div>
                                    <p className="text-white/60">Status Pembayaran</p>
                                    <p className="capitalize text-white">{order.paymentStatus || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-white/60">Pelanggan</p>
                                    <p>{order.customerName || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-white/60">Meja</p>
                                    <p>{order.table?.tableNumber || '-'}</p>
                                </div>

                                {order.description?.trim() && (
                                    <div>
                                        <p className="text-white/60">Catatan / Deskripsi</p>
                                        <p className="italic text-white">{order.description}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-white/60">Metode Pembayaran</p>
                                    <p className="text-white">{order.paymentMethod || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-white/60">Tipe Pesanan</p>
                                    <p className="text-white">{order.orderType || '-'}</p>
                                </div>

                                <div>
                                    <p className="text-white/60">Item Pesanan</p>
                                    {order.items?.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1 text-white">
                                            {order.items.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.quantity}x {item.productName || item.product?.name} - Rp{item.price.toLocaleString('id-ID')}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-white/50 italic">Tidak ada item.</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-white/60">Total</p>
                                    <p className="text-lg font-bold text-yellow-400">
                                        Rp{order.total.toLocaleString('id-ID')}
                                    </p>
                                </div>

                                {/* ✅ Tombol Sudah Bayar */}
                                {order.paymentMethod === 'cashier' && order.paymentStatus !== 'paid' && (
                                    <button
                                        onClick={handleMarkAsPaid}
                                        className="mt-4 w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-all"
                                    >
                                        ✅ Sudah Bayar
                                    </button>
                                )}
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
