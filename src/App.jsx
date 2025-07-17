import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/AppHeader';

// Impor semua halaman
import MenuPage from '@/pages/MenuPage';
import CashierPage from '@/pages/CashierPage';
import OrderPage from '@/pages/OrderPage';
import CustomerLandingPage from '@/pages/CustomerLandingPage';
import PaymentPage from '@/pages/PaymentPage';
import ReceiptPage from '@/pages/ReceiptPage';

function App() {
  // State lokal hanya untuk mengelola halaman yang aktif.
  const [currentPage, setCurrentPage] = useState('customerLanding');

  /**
   * ##################################################
   * ## LOGIKA UTAMA YANG DIPERBAIKI ADA DI FUNGSI INI ##
   * ##################################################
   */
  useEffect(() => {
    // Fungsi untuk memeriksa path URL saat ini
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path === '/cashier') {
        setCurrentPage('cashier');
      } else {
        // Untuk semua path lain, gunakan sesi dari sessionStorage
        const lastPage = sessionStorage.getItem('currentPage');
        const customerSession = sessionStorage.getItem('customerSession');
        if (lastPage && customerSession) {
          setCurrentPage(lastPage);
        } else {
          setCurrentPage('customerLanding');
        }
      }
    };

    // Panggil sekali saat komponen dimuat
    handleRouteChange();

    // Tambahkan event listener untuk mendeteksi perubahan URL (jika menggunakan React Router di masa depan)
    window.addEventListener('popstate', handleRouteChange);

    // Cleanup listener
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);


  // Fungsi navigasi sekarang juga memperbarui URL dan sessionStorage
  const navigateTo = (page) => {
    if (page === 'cashier') {
      window.history.pushState({}, '', '/cashier');
    } else if (currentPage === 'cashier' && page === 'customerLanding') {
      window.history.pushState({}, '', '/');
    }

    sessionStorage.setItem('currentPage', page);
    setCurrentPage(page);
  };

  // Semua fungsi state management lain sudah dipindahkan ke Redux

  const renderPage = () => {
    switch (currentPage) {
      case 'customerLanding':
        return <CustomerLandingPage navigateTo={navigateTo} />;
      case 'menu':
        return <MenuPage navigateTo={navigateTo} />; // Menambahkan navigateTo
      case 'order':
        return <OrderPage navigateTo={navigateTo} />;
      case 'payment':
        return <PaymentPage navigateTo={navigateTo} />;
      case 'receipt':
        return <ReceiptPage navigateTo={navigateTo} />;
      case 'cashier':
        return <CashierPage navigateTo={navigateTo} />; // Menambahkan navigateTo
      default:
        return <CustomerLandingPage navigateTo={navigateTo} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Café Horizon - Premium Coffee Experience</title>
        <meta name="description" content="A modern, high-end web application for coffee shop ordering and cashier management." />
      </Helmet>

      <div className="min-h-screen w-full bg-gray-900 text-white relative overflow-x-hidden">
        {/* Latar belakang animasi (tidak ada perubahan) */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:48px_48px]"
            style={{ maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, white 0%, transparent 100%)' }}
          />
          <motion.div
            className="absolute bottom-0 left-[-20%] right-[-20%] top-[20%] h-[500px] rounded-full bg-amber-500/10 blur-[150px]"
            animate={{ transform: ['translateX(-10%)', 'translateX(10%)', 'translateX(-10%)'] }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
          />
        </div>

        <AppHeader currentPage={currentPage} navigateTo={navigateTo} />

        {/* Konten Halaman */}
        <div className="relative z-10 pt-28">
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