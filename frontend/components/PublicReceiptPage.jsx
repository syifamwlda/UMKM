import React, { useState, useEffect } from 'react'
import { CheckCircle2, Printer, Share2, ArrowLeft, AlertCircle, Loader2, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function PublicReceiptPage({ uuid: propUuid, onNavigateHome, onNavigateDashboard }) {
  const { user, token } = useAuth()
  const isLoggedIn = Boolean(token || user)

  const [uuid, setUuid] = useState(() => {
    if (propUuid) return propUuid
    const hash = window.location.hash || ''
    if (hash.startsWith('#struk/')) {
      return hash.replace('#struk/', '').split('?')[0].trim()
    }
    const path = window.location.pathname || ''
    if (path.startsWith('/struk/')) {
      return path.replace('/struk/', '').split('?')[0].trim()
    }
    return ''
  })

  const [receipt, setReceipt] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let currentUuid = uuid
    if (!currentUuid) {
      const hash = window.location.hash || ''
      if (hash.startsWith('#struk/')) {
        currentUuid = hash.replace('#struk/', '').split('?')[0].trim()
      } else if (window.location.pathname.startsWith('/struk/')) {
        currentUuid = window.location.pathname.replace('/struk/', '').split('?')[0].trim()
      }
    }

    if (!currentUuid) {
      setError('Kode unik struk (UUID) tidak ditemukan.')
      setIsLoading(false)
      return
    }

    const fetchReceipt = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get(`/public/receipts/${currentUuid}`)
        setReceipt(res.data?.data || null)
      } catch (err) {
        console.error('Gagal mengambil struk publik:', err)
        if (err.response?.status === 404) {
          setError(err.response?.data?.message || 'Struk belanja tidak ditemukan atau tautan sudah tidak valid.')
        } else {
          setError('Gagal memuat struk belanja. Pastikan server backend sedang aktif.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchReceipt()
  }, [uuid])

  const handleBack = () => {
    if (isLoggedIn) {
      if (onNavigateDashboard) {
        onNavigateDashboard()
      } else {
        window.location.hash = '#dashboard'
      }
    } else {
      if (onNavigateHome) {
        onNavigateHome()
      } else {
        window.location.hash = '#'
      }
    }
  }

  const handleCopyLink = () => {
    const fullUrl = window.location.origin + '/#struk/' + uuid
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const formatTanggal = (dateString) => {
    if (!dateString) return '-'
    try {
      const d = new Date(dateString)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    } catch {
      return dateString
    }
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#F4F6F8] flex flex-col justify-between py-2 sm:py-3 px-4 antialiased select-none print:h-auto print:max-h-none print:overflow-visible print:bg-white print:p-0">
      {/* Top Header Bar */}
      <header className="max-w-md sm:max-w-[475px] w-full mx-auto flex items-center justify-between pb-1 shrink-0 print:hidden">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors py-1 px-2.5 rounded-xl hover:bg-white/80 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
          <span>{isLoggedIn ? 'Kembali ke Dashboard' : 'Kembali ke Beranda'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-emerald-100 p-0.5 flex items-center justify-center">
            <img src="/assets/Icons/logo.png" alt="UntungJelas" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-black text-gray-900 tracking-tight">UntungJelas</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md sm:max-w-[475px] w-full mx-auto flex-1 flex flex-col justify-center min-h-0 my-auto py-1 print:my-0 print:py-0 print:max-w-none">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009B5B] flex items-center justify-center mx-auto">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Memuat Struk Belanja...</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Mengambil data transaksi resmi kasir UMKM</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-lg text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900">Struk Tidak Ditemukan</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="py-2 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {isLoggedIn ? 'Kembali ke Dashboard' : 'Buka Beranda UntungJelas'}
            </button>
          </div>
        ) : receipt ? (
          <div className="relative filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.07)] animate-fade-in w-full">
            {/* The White Receipt Paper Body */}
            <div className="bg-white rounded-t-2xl px-6 sm:px-7 pt-5 sm:pt-6 pb-3 space-y-3 relative">
              {/* Store & Transaction Header */}
              <div className="text-center space-y-1 pb-1.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#009B5B] flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.4]" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight leading-tight">
                  {receipt.business_name}
                </h2>
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium font-mono">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{formatTanggal(receipt.paid_at || receipt.date)}</span>
                </div>
              </div>

              {/* List of Purchased Items (No scrollbar) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">
                  <span>Rincian Pembelian</span>
                  <span>Subtotal</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {(receipt.items || []).map((item, idx) => {
                    const qty = item.qty || 1
                    const price = item.price || item.unit_price || 0
                    const subtotal = item.subtotal || (price * qty)

                    return (
                      <div key={idx} className="py-2 flex items-start justify-between gap-3 text-xs sm:text-[13px]">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate leading-snug">{item.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {qty} x Rp{price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 text-right shrink-0">
                          Rp{subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Authentic Receipt Ticket Notch & Perforated Cut Line */}
              <div className="relative flex items-center justify-between my-2 -mx-6 sm:-mx-7 bg-white">
                {/* Left Notch */}
                <div className="w-4 h-7 bg-[#F4F6F8] rounded-r-full border-y border-r border-gray-200/50 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.03)]" />
                {/* Dashed Tear Line */}
                <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2.5" />
                {/* Right Notch */}
                <div className="w-4 h-7 bg-[#F4F6F8] rounded-l-full border-y border-l border-gray-200/50 shadow-[inset_2px_0_4px_rgba(0,0,0,0.03)]" />
              </div>

              {/* Total Payment Bill */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-gray-600">Total Pembayaran</span>
                  <span className="text-xl sm:text-2xl font-black text-[#009B5B] tracking-tight">
                    Rp{Number(receipt.total || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Status Pembayaran</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                    Lunas
                  </span>
                </div>
              </div>

              {/* Action Buttons: Print & Copy Link */}
              <div className="pt-2 grid grid-cols-2 gap-2.5 print:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200/80 active:scale-98"
                >
                  <Printer className="w-4 h-4 text-gray-500" />
                  <span>Cetak Struk</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-[#009B5B] rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200 active:scale-98"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'Tautan Disalin!' : 'Bagikan Struk'}</span>
                </button>
              </div>

              {/* Footer Guarantee */}
              <div className="text-center pt-2 pb-1 border-t border-gray-100">
                <p className="text-[10px] sm:text-[11px] text-gray-400">
                  Struk resmi kasir <span className="font-bold text-gray-600">UntungJelas</span>
                </p>
              </div>
            </div>

            {/* Sawtooth / Zigzag Bottom Tear Edge (Receipt Shape) */}
            <div className="w-full h-3 overflow-hidden leading-none -mt-px select-none">
              <svg
                className="w-full h-3 fill-white"
                preserveAspectRatio="none"
                viewBox="0 0 240 12"
              >
                <polygon points="0,0 6,12 12,0 18,12 24,0 30,12 36,0 42,12 48,0 54,12 60,0 66,12 72,0 78,12 84,0 90,12 96,0 102,12 108,0 114,12 120,0 126,12 132,0 138,12 144,0 150,12 156,0 162,12 168,0 174,12 180,0 186,12 192,0 198,12 204,0 210,12 216,0 222,12 228,0 234,12 240,0" />
              </svg>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-1 shrink-0 text-[10px] sm:text-[11px] text-gray-400 print:hidden">
        &copy; {new Date().getFullYear()} UntungJelas • Aplikasi Kasir & Kalkulator HPP UMKM Indonesia
      </footer>
    </div>
  )
}
