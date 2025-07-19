'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Coffee, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useDispatch } from 'react-redux';
import { startSession } from '../features/customer/customerSlice';

export default function CustomerLandingPage({ navigateTo }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [orderType, setOrderType] = useState(null);

  const handleStartOrder = () => {
    if (name.trim().length < 2) {
      toast({
        title: "Nama Belum Diisi",
        description: "Silakan isi nama terlebih dahulu.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!orderType) {
      toast({
        title: "Tipe Pesanan Belum Dipilih",
        description: "Pilih antara Dine In atau Take Away.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    dispatch(startSession({ customerName: name, orderType }));
    toast({
      title: `Halo, ${name}!`,
      description: `Kamu memilih ${orderType === 'dine-in' ? 'Dine In' : 'Take Away'}. Selamat menikmati.`,
      duration: 3000,
    });

    navigateTo('menu');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-[0_10px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
            Welcome to Your Brew
          </h1>
          <p className="text-sm text-slate-300 mt-2">Experience your coffee ritual in style ✨</p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="text-slate-200 text-sm font-medium block mb-2">
              What's your name?
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Aisha"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
            </div>
          </div>

          {/* Order Type */}
          <div>
            <p className="text-slate-200 text-sm font-medium mb-3">Select your experience:</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'dine-in', label: 'Dine In', Icon: Coffee },
                { type: 'take away', label: 'Take Away', Icon: Store },
              ].map(({ type, label, Icon }) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`
                    group relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2
                    transition-all duration-300 transform 
                    ${orderType === type
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-transparent hover:border-white/30 hover:scale-[1.03]'}
                  `}
                >
                  <div className="text-yellow-300 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="text-white font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={handleStartOrder}
              disabled={!name.trim() || !orderType}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-bold py-3 rounded-xl 
                transition-all duration-300 transform hover:scale-[1.03] hover:shadow-yellow-300/20 shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Let’s Order <ArrowRight className="inline-block w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
