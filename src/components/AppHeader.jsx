// src/components/AppHeader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Calculator, ShoppingCart, Home, Receipt as ReceiptIcon } from 'lucide-react';

const NavButton = ({ onClick, icon: Icon, label, isActive, hasBadge, badgeCount }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${isActive
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/15'
            }`}
    >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
        {hasBadge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-800">
                {badgeCount}
            </span>
        )}
    </motion.button>
);

export default function AppHeader({ currentPage, navigateTo, cart, selectedOrder }) {
    const isCustomerFlow = ['customerLanding', 'menu', 'order', 'payment', 'receipt'].includes(currentPage);
    const isCashierFlow = currentPage === 'cashier';

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const customerNavLinks = [
        { page: 'menu', label: 'Menu', icon: Coffee },
        { page: 'order', label: 'Cart', icon: ShoppingCart, hasBadge: cart.length > 0, badgeCount: cartItemCount },
        ...(selectedOrder ? [{ page: 'receipt', label: 'Receipt', icon: ReceiptIcon }] : []),
    ];

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 p-4 no-print"
        >
            <div className="max-w-7xl mx-auto">
                <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/30">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigateTo('customerLanding')}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Coffee className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                    Café Horizon
                                </h1>
                                <p className="text-xs text-gray-400 -mt-1">Premium Coffee Experience</p>
                            </div>
                        </motion.div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-2">
                            {isCustomerFlow && customerNavLinks.map(link => (
                                <NavButton
                                    key={link.page}
                                    onClick={() => navigateTo(link.page)}
                                    icon={link.icon}
                                    label={link.label}
                                    isActive={currentPage === link.page}
                                    hasBadge={link.hasBadge}
                                    badgeCount={link.badgeCount}
                                />
                            ))}
                            <div className="w-px h-6 bg-white/10 mx-2" />
                            <NavButton
                                onClick={() => navigateTo(isCashierFlow ? 'customerLanding' : 'cashier')}
                                icon={isCashierFlow ? Home : Calculator}
                                label={isCashierFlow ? 'Home' : 'Cashier'}
                                isActive={isCashierFlow}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}