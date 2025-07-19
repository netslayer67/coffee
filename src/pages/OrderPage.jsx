'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Edit3, Coffee, Trash2, ChevronRight, Loader2, Minus, Plus, LayoutGrid
} from 'lucide-react';
import {
  selectCart, updateCartQuantity, clearCart,
  createOrder, selectCurrentOrder, selectOrderStatus
} from '../features/orders/orderSlice';
import { selectCustomerSession } from '../features/customer/customerSlice';
import {
  fetchTables, selectAllTables, selectTableStatus
} from '../features/tables/tableSlice';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function OrderPage({ navigateTo }) {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const customer = useSelector(selectCustomerSession);
  const orderStatus = useSelector(selectOrderStatus);
  const currentOrder = useSelector(selectCurrentOrder);
  const tables = useSelector(selectAllTables);
  const tableStatus = useSelector(selectTableStatus);

  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return {
      subtotal: sub,
      taxAmount: sub * 0.11,
      total: sub * 1.11,
    };
  }, [cart]);

  const handleSubmitOrder = () => {
    if (customer.orderType === 'dine-in' && !customer.tableId) {
      toast({ title: 'Pilih meja terlebih dahulu.', variant: 'destructive' });
      return;
    }
    if (!cart.length) {
      toast({ title: 'Keranjang kosong.', description: 'Tambahkan produk terlebih dahulu.', variant: 'destructive' });
      return;
    }

    const orderData = {
      customerName: customer.customerName,
      table: customer.tableId,
      orderType: customer.orderType,
      description,
      items: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal,
    };

    dispatch(createOrder(orderData))
      .unwrap()
      .then((order) => {
        sessionStorage.setItem('currentOrder', JSON.stringify(order));
        navigateTo('payment');
      })
      .catch((err) => {
        toast({ title: 'Gagal membuat pesanan', description: err.message, variant: 'destructive' });
      });
  };

  return (
    <div className="min-h-screen px-4 py-8 text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8 xl:col-span-2">
          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-300">
                <User size={20} /> Your Info
              </h2>
              <Button size="sm" onClick={() => navigateTo('customerLanding')} className="text-sm bg-transparent hover:bg-white/10">
                <Edit3 size={16} className="mr-1" /> Edit
              </Button>
            </div>
            <p className="text-sm mt-2">Name: <span className="font-semibold">{customer.customerName}</span></p>
            <p className="text-sm">Table: <span className="font-semibold">{customer.tableNumber || 'Not selected'}</span></p>
            {customer.orderType === 'dine-in' && (
              <Button onClick={() => setShowModal(true)} className="mt-3 text-yellow-400 underline underline-offset-2" variant="ghost">
                <LayoutGrid className="w-4 h-4 mr-1" /> Choose Table
              </Button>
            )}
            {currentOrder?.orderNumber && (
              <p className="text-sm mt-2">Order #: <span className="font-semibold">{currentOrder.orderNumber}</span></p>
            )}
          </motion.div>

          {/* Cart Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
                <Coffee size={18} /> Your Order ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </h3>
              <Button onClick={() => dispatch(clearCart())} variant="ghost" className="text-red-400">
                <Trash2 size={16} className="mr-1" /> Clear
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 hover:scale-[1.015] transition-transform"
                  >
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl shadow-md object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-yellow-400">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => dispatch(updateCartQuantity({ itemId: item._id, quantity: item.quantity - 1 }))}><Minus size={14} /></Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button size="icon" variant="ghost" onClick={() => dispatch(updateCartQuantity({ itemId: item._id, quantity: item.quantity + 1 }))}><Plus size={14} /></Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div className="glass-card">
            <label className="text-sm font-medium mb-2 block text-white/80">Add Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="e.g. Less spicy, no sugar..."
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <motion.aside
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card h-fit sticky top-28 space-y-5"
        >
          <div className="text-sm space-y-3">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax (11%)</span><span>{formatPrice(taxAmount)}</span></div>
            <div className="flex justify-between border-t border-white/20 pt-3 font-bold text-yellow-300 text-lg">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button
            onClick={handleSubmitOrder}
            disabled={orderStatus === 'loading'}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-black font-semibold py-3 rounded-xl transition-all duration-300 active:scale-95"
          >
            {orderStatus === 'loading' ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Proceed to Payment <ChevronRight className="ml-2 w-5 h-5" />
              </span>
            )}
          </Button>
        </motion.aside>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card w-[90%] max-w-lg p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold mb-4">Choose a Table</h3>
              {tableStatus === 'loading' ? (
                <p className="text-sm text-white/60 text-center">Loading tables...</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {tables.map(table => (
                    <button
                      key={table._id}
                      onClick={() => {
                        dispatch({ type: 'customer/setTableInfo', payload: { tableId: table._id, tableName: table.tableNumber } });
                        setShowModal(false);
                      }}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white hover:bg-yellow-400 hover:text-black transition-all"
                    >
                      {table.tableNumber}
                    </button>
                  ))}
                </div>
              )}
              <Button onClick={() => setShowModal(false)} className="mt-6 w-full bg-red-400 hover:bg-red-500">
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
