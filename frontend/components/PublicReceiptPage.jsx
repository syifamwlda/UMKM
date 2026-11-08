import React, { useState, useEffect } from 'react'
import { CheckCircle2, Printer, Share2, ArrowLeft, AlertCircle, Loader2, Store, Calendar, ShoppingBag } from 'lucide-react'
import api from '../services/api'

export default function PublicReceiptPage({ uuid: propUuid, onNavigateHome }) {
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

  const handleCopyLink = () => {
    const fullUrl = window.location.origin + '/#struk/' + uuid
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      // Fallback manual
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-gray-50 to-white flex flex-col justify-between p-4 sm:p-6 antialiased">
      {/* Top Header Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between pb-4">
        <button
          type="button"
          onClick={() => {
            if (onNavigateHome) onNavigateHome()
            else window.location.hash = '#'
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors py-1.5 px-3 rounded-xl hover:bg-white/80 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 p-1 flex items-center justify-center">
            <img src="/assets/Icons/logo.png" alt="UntungJelas" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-black text-gray-900 tracking-tight">UntungJelas</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center my-4">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#009B5B] flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Memuat Struk Belanja...</h3>
              <p className="text-xs text-gray-400 mt-1">Mengambil data transaksi resmi kasir UMKM</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">Struk Tidak Ditemukan</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onNavigateHome) onNavigateHome()
                else window.location.hash = '#'
              }}
              className="py-2.5 px-5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Buka Beranda UntungJelas
            </button>
          </div>
        ) : receipt ? (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xl space-y-5 animate-fade-in relative overflow-hidden">
            {/* Top decorative receipt cut styling */}
            <div className="text-center space-y-2 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#009B5B] flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                {receipt.business_name}
              </h2>
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{formatTanggal(receipt.paid_at || receipt.date)}</span>
              </div>
            </div>

            {/* List of Purchased Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider pb-1">
                <span>Rincian Pembelian</span>
                <span>Subtotal</span>
              </div>

              <div className="divide-y divide-gray-100">
                {(receipt.items || []).map((item, idx) => {
                  const qty = item.qty || 1
                  const price = item.price || item.unit_price || 0
                  const subtotal = item.subtotal || (price * qty)

                  return (
                    <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-gray-900 leading-snug">{item.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
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

            {/* Total Payment Bill */}
            <div className="pt-4 border-t-2 border-dashed border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Total Pembayaran</span>
                <span className="text-xl sm:text-2xl font-black text-[#009B5B] tracking-tight">
                  Rp{Number(receipt.total || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Status Pembayaran</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Lunas</span>
              </div>
            </div>

            {/* Action Buttons: Print & Copy Link */}
            <div className="pt-2 grid grid-cols-2 gap-2.5 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200/80"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                <span>Cetak Struk</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#009B5B] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Tautan Disalin!' : 'Bagikan Struk'}</span>
              </button>
            </div>

            {/* Footer Guarantee */}
            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-[10px] text-gray-400">
                Struk digital resmi diterbitkan oleh sistem kasir <span className="font-bold text-gray-600">UntungJelas</span>.
              </p>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-3 text-[11px] text-gray-400">
        &copy; {new Date().getFullYear()} UntungJelas • Aplikasi Kasir & Kalkulator HPP UMKM Indonesia
      </footer>
    </div>
  )
}

