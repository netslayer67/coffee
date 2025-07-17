'use client'
import React, { useState, useEffect } from 'react'
import {
  QrCode, Landmark, Banknote, CheckCircle, Loader2
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createPaymentTransaction,
  processCashPayment,
  selectTransactionToken,
  selectPaymentStatus,
  clearPaymentState
} from '../features/payments/paymentSlice'
import { selectCurrentOrder } from '../features/orders/orderSlice'
import { setPaymentMethod } from '../features/customer/customerSlice'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

export default function PaymentPage({ navigateTo }) {
  const dispatch = useDispatch()
  const order = useSelector(selectCurrentOrder)
  const paymentStatus = useSelector(selectPaymentStatus)
  const transactionToken = useSelector(selectTransactionToken)
  const [selectedMethod, setSelectedMethod] = useState(null)

  useEffect(() => {
    const scriptId = 'midtrans-snap-script'
    const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = snapScriptUrl
      script.setAttribute('data-client-key', clientKey)
      document.body.appendChild(script)
    }

    if (transactionToken) {
      window.snap.pay(transactionToken, {
        onSuccess: () => {
          toast({ title: '🎉 Pembayaran Berhasil!', description: 'Pesanan Anda telah dibayar.' })
          navigateTo('receipt')
        },
        onPending: () => {
          toast({ title: 'Menunggu Pembayaran', description: 'Selesaikan pembayaran Anda.' })
          navigateTo('receipt')
        },
        onError: () => {
          toast({ title: 'Gagal', description: 'Terjadi kesalahan. Silakan coba lagi.', variant: 'destructive' })
          dispatch(clearPaymentState())
        },
        onClose: () => dispatch(clearPaymentState())
      })
    }

    return () => dispatch(clearPaymentState())
  }, [transactionToken, dispatch, navigateTo])

  const handlePayment = () => {
    if (!selectedMethod || !order) {
      toast({
        title: 'Lengkapi Informasi',
        description: 'Pilih metode dan pastikan pesanan tersedia.',
        variant: 'destructive'
      })
      return
    }

    if (['qris', 'bca_va'].includes(selectedMethod)) {
      dispatch(setPaymentMethod(selectedMethod))
      dispatch(createPaymentTransaction(order._id))
    } else if (selectedMethod === 'cashier') {
      dispatch(processCashPayment(order))
      toast({
        title: 'Bayar di Kasir',
        description: 'Tunjukkan nomor pesanan Anda.'
      })
      navigateTo('receipt')
    }
  }

  const paymentMethods = [
    { id: 'qris', name: 'QRIS', icon: QrCode, description: 'Bayar dengan QR e-wallet Anda' },
    { id: 'bca_va', name: 'BCA Virtual Account', icon: Landmark, description: 'Transfer antar bank BCA' },
    { id: 'cashier', name: 'Bayar di Kasir', icon: Banknote, description: 'Tunai/kartu di konter' }
  ]

  const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price?.toFixed(0) || 0)

  const fallbackTotal = order?.subtotal ? order.subtotal * 1.11 : 0
  const formattedTotal = formatPrice(order?.total ?? fallbackTotal)

  return (
    <div className="min-h-screen text-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-10">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-transparent bg-clip-text tracking-tight">
            Metode Pembayaran
          </h1>
          <p className="mt-2 text-sm text-gray-400">Pilih metode pembayaran Anda dengan aman dan nyaman.</p>
        </div>

        <div className="rounded-3xl p-6 sm:p-10 bg-white/10 backdrop-blur-lg shadow-[0_15px_60px_rgba(255,255,255,0.05)] border border-white/10 space-y-8 transition-all">
          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`group cursor-pointer flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border hover:scale-[1.02] transform-gpu relative overflow-hidden
                  ${selectedMethod === method.id
                    ? 'bg-amber-400/10 border-amber-400'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                style={{ perspective: 1000 }}
              >
                <div className="w-10 h-10 flex items-center justify-center text-amber-400 group-hover:rotate-6 transition-transform duration-300">
                  <method.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium">{method.name}</p>
                  <p className="text-sm text-gray-400">{method.description}</p>
                </div>
                {selectedMethod === method.id && <CheckCircle className="w-6 h-6 text-green-400" />}
                {/* Floating shimmer */}
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 via-white/0 to-transparent rotate-45 group-hover:animate-tilt-glow pointer-events-none" />
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400">Total Bayar</p>
            <p className="text-3xl font-semibold text-amber-400 mt-1">{formattedTotal}</p>

            <Button
              onClick={handlePayment}
              disabled={paymentStatus === 'loading' || !selectedMethod}
              className="mt-6 w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-lg shadow-emerald-500/20"
            >
              {paymentStatus === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...
                </>
              ) : (
                `Bayar Sekarang ${formattedTotal}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
