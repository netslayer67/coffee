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
  // 1. State lokal sekarang HANYA untuk mengelola halaman yang aktif.
  const [currentPage, setCurrentPage] = useState('customerLanding');

  // 2. Logika untuk menjaga sesi halaman saat refresh.
  useEffect(() => {
    // Ambil halaman terakhir dari sessionStorage saat komponen dimuat
    const lastPage = sessionStorage.getItem('currentPage');
    const customerSession = sessionStorage.getItem('customerSession');

    // Jika ada sesi pelanggan dan halaman terakhir tersimpan,
    // arahkan ke sana, bukan ke halaman awal.
    if (lastPage && customerSession) {
      setCurrentPage(lastPage);
    }
  }, []);

  // 3. Fungsi navigasi sekarang juga menyimpan halaman ke sessionStorage.
  const navigateTo = (page) => {
    sessionStorage.setItem('currentPage', page);
    setCurrentPage(page);
  };

  // 4. Semua fungsi state management (addToCart, addOrder, dll.)
  //    TELAH DIHAPUS. Logika ini sekarang ada di dalam slice Redux.

  const renderPage = () => {
    // 5. Props yang dioper ke setiap komponen menjadi jauh lebih sedikit.
    //    Setiap halaman sekarang mengambil datanya sendiri dari Redux.
    switch (currentPage) {
      case 'customerLanding':
        return <CustomerLandingPage navigateTo={navigateTo} />;
      case 'menu':
        return <MenuPage />;
      case 'order':
        return <OrderPage navigateTo={navigateTo} />;
      case 'payment':
        return <PaymentPage navigateTo={navigateTo} />;
      case 'receipt':
        return <ReceiptPage navigateTo={navigateTo} />;
      case 'cashier':
        return <CashierPage />;
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

        {/* AppHeader sekarang mengambil datanya sendiri dari Redux */}
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