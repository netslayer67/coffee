import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/AppHeader';

import MenuPage from '@/pages/MenuPage';
import CashierPage from '@/pages/CashierPage';
import OrderPage from '@/pages/OrderPage';
import CustomerLandingPage from '@/pages/CustomerLandingPage';
import PaymentPage from '@/pages/PaymentPage';
import ReceiptPage from '@/pages/ReceiptPage';

// Detect receipt type
function useReceiptVariant() {
  const location = useLocation();
  const pathname = location.pathname;

  const isSharedReceipt = /^\/receipt\/[^/]+\/[a-zA-Z0-9]+$/.test(pathname);      // /receipt/{customerName}/{orderId}
  const isAppReceipt = /^\/receipt\/[a-zA-Z0-9]+$/.test(pathname);                // /receipt/{orderId}

  return {
    isSharedReceipt,
    isAppReceipt,
    isReceipt: isSharedReceipt || isAppReceipt,
  };
}

function MainApp() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('customerLanding');
  const { isSharedReceipt, isAppReceipt, isReceipt } = useReceiptVariant();

  useEffect(() => {
    if (!isReceipt) {
      const lastPage = sessionStorage.getItem('currentPage');
      const customerSession = sessionStorage.getItem('customerSession');

      if (location.pathname === '/cashier') {
        setCurrentPage('cashier');
      } else if (lastPage && customerSession) {
        setCurrentPage(lastPage);
      } else {
        setCurrentPage('customerLanding');
      }
    }
  }, [location.pathname, isReceipt]);

  const navigateTo = (page) => {
    if (page === 'cashier') {
      window.history.pushState({}, '', '/cashier');
    } else if (currentPage === 'cashier' && page === 'customerLanding') {
      window.history.pushState({}, '', '/');
    }

    sessionStorage.setItem('currentPage', page);
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'customerLanding':
        return <CustomerLandingPage navigateTo={navigateTo} />;
      case 'menu':
        return <MenuPage navigateTo={navigateTo} />;
      case 'order':
        return <OrderPage navigateTo={navigateTo} />;
      case 'payment':
        return <PaymentPage />;
      case 'cashier':
        return <CashierPage navigateTo={navigateTo} />;
      default:
        return <CustomerLandingPage navigateTo={navigateTo} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Café Horizon - Premium Coffee Experience</title>
        <meta
          name="description"
          content="A modern, high-end web application for coffee shop ordering and cashier management."
        />
      </Helmet>

      <div className="min-h-screen w-full bg-gray-900 text-white relative overflow-x-hidden">
        {/* Background Grid & Blur Effect */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:48px_48px]"
            style={{
              maskImage:
                'radial-gradient(ellipse 80% 50% at 50% 0%, white 0%, transparent 100%)',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-[-20%] right-[-20%] top-[20%] h-[500px] rounded-full bg-amber-500/10 blur-[150px]"
            animate={{
              transform: [
                'translateX(-10%)',
                'translateX(10%)',
                'translateX(-10%)',
              ],
            }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'mirror',
            }}
          />
        </div>

        {/* Hide AppHeader only on all receipt pages */}
        {!isReceipt && (
          <AppHeader currentPage={currentPage} navigateTo={navigateTo} />
        )}

        {/* Main Content with optional top padding */}
        <div className={`relative z-10 ${isSharedReceipt ? '' : 'pt-28'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <Routes>
                <Route path="/receipt/:customerName/:orderId" element={<ReceiptPage />} />
                <Route path="/receipt/:orderId" element={<ReceiptPage />} />
                <Route path="*" element={renderPage()} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>

        <Toaster />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
