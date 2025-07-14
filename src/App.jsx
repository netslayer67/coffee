
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import MenuPage from '@/pages/MenuPage';
import CashierPage from '@/pages/CashierPage';
import OrderPage from '@/pages/OrderPage';
import CustomerLandingPage from '@/pages/CustomerLandingPage';
import PaymentPage from '@/pages/PaymentPage';
import ReceiptPage from '@/pages/ReceiptPage';
import { Coffee, Calculator, ShoppingCart, Home, Receipt } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('customerLanding');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', tableNumber: '' });

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

  const clearCart = () => {
    setCart([]);
  };

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

  const renderPage = () => {
    switch (currentPage) {
      case 'customerLanding':
        return <CustomerLandingPage setCustomerInfo={setCustomerInfo} navigateTo={navigateTo} />;
      case 'menu':
        return <MenuPage addToCart={addToCart} cart={cart} />;
      case 'order':
        return (
          <OrderPage
            cart={cart}
            updateCartItem={updateCartItem}
            clearCart={clearCart}
            addOrder={addOrder}
            customerInfo={customerInfo}
            navigateTo={navigateTo}
          />
        );
      case 'payment':
        return <PaymentPage order={selectedOrder} updateOrderStatus={updateOrderStatus} navigateTo={navigateTo} />;
      case 'receipt':
        return <ReceiptPage order={selectedOrder} navigateTo={navigateTo} />;
      case 'cashier':
        return (
          <CashierPage
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            viewReceipt={viewReceipt}
          />
        );
      default:
        return <CustomerLandingPage setCustomerInfo={setCustomerInfo} navigateTo={navigateTo} />;
    }
  };

  const isCustomerFlow = ['customerLanding', 'menu', 'order', 'payment', 'receipt'].includes(currentPage) && selectedOrder?.status !== 'completed';
  const isCashierFlow = currentPage === 'cashier';

  return (
    <>
      <Helmet>
        <title>Café Horizon - Premium Coffee Experience</title>
        <meta name="description" content="Experience premium coffee with our modern cashier system and elegant ordering interface" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
        {/* ... keep existing code (backgrounds) */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:36px_36px]"
            style={{ maskImage: 'radial-gradient(ellipse at center, white 20%, transparent 70%)' }}
          />
        </div>

        {/* Radial Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px] animate-pulse" />

        {/* Decorative Lines Pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-0.5 bg-gradient-to-r from-amber-400 to-transparent rotate-45 animate-pulse" />
          <div className="absolute top-40 right-20 w-24 h-0.5 bg-gradient-to-l from-emerald-400 to-transparent -rotate-45 animate-pulse delay-1000" />
          <div className="absolute bottom-32 left-1/4 w-40 h-0.5 bg-gradient-to-r from-blue-400 to-transparent rotate-12 animate-pulse delay-2000" />
          <div className="absolute bottom-20 right-1/3 w-28 h-0.5 bg-gradient-to-l from-purple-400 to-transparent -rotate-12 animate-pulse delay-3000" />
        </div>

        {/* Navigation */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-50 p-6 no-print"
        >
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 cursor-pointer"
                   onClick={() => navigateTo('customerLanding')}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      Café Horizon
                    </h1>
                    <p className="text-xs text-gray-400">Premium Coffee Experience</p>
                  </div>
                </motion.div>
                
                <div className="flex items-center space-x-2">
                   {isCustomerFlow && (
                    <>
                      <motion.button onClick={() => navigateTo('menu')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 ${ currentPage === 'menu' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                        <Coffee className="w-4 h-4" /> <span>Menu</span>
                      </motion.button>
                      <motion.button onClick={() => navigateTo('order')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 ${ currentPage === 'order' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                        <ShoppingCart className="w-4 h-4" /> <span>Keranjang</span>
                        {cart.length > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                          </span>
                        )}
                      </motion.button>
                       {selectedOrder && (
                          <motion.button onClick={() => viewReceipt(selectedOrder)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 ${ currentPage === 'receipt' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                            <Receipt className="w-4 h-4" /> <span>Struk</span>
                          </motion.button>
                       )}
                    </>
                  )}
                  <motion.button onClick={() => navigateTo(isCashierFlow ? 'customerLanding' : 'cashier')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 ${ isCashierFlow ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                    {isCashierFlow ? <Home className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
                    <span>{isCashierFlow ? 'Home' : 'Kasir'}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Page Content */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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