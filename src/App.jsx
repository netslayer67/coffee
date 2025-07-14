// src/App.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';

// Import Pages and the new Header
import AppHeader from '@/components/AppHeader';
import MenuPage from '@/pages/MenuPage';
import CashierPage from '@/pages/CashierPage';
import OrderPage from '@/pages/OrderPage';
import CustomerLandingPage from '@/pages/CustomerLandingPage';
import PaymentPage from '@/pages/PaymentPage';
import ReceiptPage from '@/pages/ReceiptPage';

function App() {
  // State management remains the same
  const [currentPage, setCurrentPage] = useState('customerLanding');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', tableNumber: '' });

  // Navigation and state functions remain the same
  const navigateTo = (page) => setCurrentPage(page);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateCartItem = (id, quantity) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => setCart([]);

  const addOrder = (order) => {
    const newOrder = { ...order, status: 'pending' };
    setOrders(prevOrders => [...prevOrders, newOrder]);
    setSelectedOrder(newOrder);
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status }));
    }
  };

  const viewReceipt = (order) => {
    setSelectedOrder(order);
    navigateTo('receipt');
  };

  // The page rendering logic is unchanged
  const renderPage = () => {
    switch (currentPage) {
      case 'customerLanding':
        return <CustomerLandingPage setCustomerInfo={setCustomerInfo} navigateTo={navigateTo} />;
      case 'menu':
        return <MenuPage addToCart={addToCart} cart={cart} />;
      case 'order':
        return <OrderPage cart={cart} updateCartItem={updateCartItem} clearCart={clearCart} addOrder={addOrder} customerInfo={customerInfo} navigateTo={navigateTo} />;
      case 'payment':
        return <PaymentPage order={selectedOrder} updateOrderStatus={updateOrderStatus} navigateTo={navigateTo} />;
      case 'receipt':
        return <ReceiptPage order={selectedOrder} navigateTo={navigateTo} />;
      case 'cashier':
        return <CashierPage orders={orders} updateOrderStatus={updateOrderStatus} viewReceipt={viewReceipt} />;
      default:
        return <CustomerLandingPage setCustomerInfo={setCustomerInfo} navigateTo={navigateTo} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Café Horizon - Premium Coffee Experience</title>
        <meta name="description" content="A modern, high-end web application for coffee shop ordering and cashier management." />
      </Helmet>

      {/* Main App Container */}
      <div className="min-h-screen w-full bg-gray-900 text-white relative overflow-x-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:36px_36px]"
            style={{ maskImage: 'radial-gradient(ellipse at center, white 10%, transparent 60%)' }}
          />
          <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[150px] animate-pulse" />
        </div>

        {/* The New, Clean Header */}
        <AppHeader
          currentPage={currentPage}
          navigateTo={navigateTo}
          cart={cart}
          selectedOrder={selectedOrder}
        />

        {/* Page Content with offset for fixed header */}
        <div className="relative z-10 pt-28"> {/* Added padding-top */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>

        <Toaster />
      </div>
    </>
  );
}

export default App;