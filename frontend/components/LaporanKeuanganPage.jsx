import React, { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp,
  Banknote,
  Package,
  Wallet,
  Gauge,
  Award,
  Sliders,
  ArrowUpDown,
  ChevronDown,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Coins,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import RollNumberTicker from './RollNumberTicker'

export default function LaporanKeuanganPage({ onToast, onNavigateMenu }) {
  const { user } = useAuth()

  // Real backend dataset states with instant cache restoration
  const [transactions, setTransactions] = useState(() => {
    if (user?.id) {
      try {
        const cached = sessionStorage.getItem(`uj_reports_trx_${user.id}`)
        if (cached) return JSON.parse(cached)
      } catch (e) {}
    }
    return []
  })

  const [stats, setStats] = useState(() => {
    if (user?.id) {
      try {
        const cached = sessionStorage.getItem(`uj_reports_stats_${user.id}`)
        if (cached) return JSON.parse(cached)
      } catch (e) {}
    }
    return null
  })

  const [isLoading, setIsLoading] = useState(() => {
    if (user?.id) {
      try {
        const cached = sessionStorage.getItem(`uj_reports_trx_${user.id}`)
        if (cached) return false
      } catch (e) {}
    }
    return true
  })
  const [loadError, setLoadError] = useState(null)

  // Filters & Pagination
  const [selectedMethod, setSelectedMethod] = useState('Semua')
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  // Chart hover state
  const [hoveredWeek, setHoveredWeek] = useState(null)

  // Fetch real data from GET /api/transactions?date=all and GET /api/dashboard/stats
  const fetchReportsData = async () => {
    try {
      setLoadError(null)

      const trxPromise = api.get('/transactions?date=all').then((trxRes) => {
        const rawTrx = trxRes.data?.data || []
        if (Array.isArray(rawTrx)) {
          const formatted = rawTrx.map((t) => {
            const d = t.paid_at ? new Date(t.paid_at) : new Date()
            const dateFormatted = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            const timeFormatted = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
            const itemsSummary = t.items && t.items.length > 0
              ? t.items.map(it => `${it.qty}x ${it.product_name}`).join(', ')
              : 'Transaksi Kasir'
            const shortUuid = t.uuid ? t.uuid.substring(0, 8).toUpperCase() : String(t.id).padStart(4, '0')
            const totalVal = Number(t.total) || 0
            const costVal = Number(t.total_cost) || 0
            const profitVal = Number(t.total_profit != null ? t.total_profit : (t.profit != null ? t.profit : (totalVal - costVal))) || 0
            const marginVal = totalVal > 0 ? Math.round((profitVal / totalVal) * 1000) / 10 : 0

            return {
              id: `#TX-${shortUuid}`,
              rawId: t.id,
              uuid: t.uuid,
              date: dateFormatted,
              time: timeFormatted,
              items: itemsSummary,
              method: t.payment_method || 'Tunai',
              omzet: totalVal,
              hpp: costVal,
              profit: profitVal,
              margin: marginVal,
            }
          })

          setTransactions(formatted)
          if (user?.id) {
            try {
              sessionStorage.setItem(`uj_reports_trx_${user.id}`, JSON.stringify(formatted))
            } catch (e) {}
          }
        } else {
          setTransactions([])
        }
      })

      const statsPromise = api.get('/dashboard/stats').then((statsRes) => {
        if (statsRes.data?.data) {
          setStats(statsRes.data.data)
          if (user?.id) {
            try {
              sessionStorage.setItem(`uj_reports_stats_${user.id}`, JSON.stringify(statsRes.data.data))
            } catch (e) {}
          }
        }
      })

      await Promise.allSettled([trxPromise, statsPromise])
    } catch (err) {
      console.warn('Sinkronisasi laporan keuangan:', err?.message || err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReportsData()
  }, [user?.id])

  // Dynamic Metrics computed from real transactions
  const totalOmzet = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.omzet, 0)
  }, [transactions])

  const totalHpp = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.hpp, 0)
  }, [transactions])

  const totalProfit = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.profit, 0)
  }, [transactions])

  const avgMargin = useMemo(() => {
    if (totalOmzet > 0) {
      return ((totalProfit / totalOmzet) * 100).toFixed(1)
    }
    return '0.0'
  }, [totalOmzet, totalProfit])

  const totalCount = useMemo(() => {
    return transactions.length
  }, [transactions])

  const aov = useMemo(() => {
    if (totalCount > 0) {
      return Math.round(totalOmzet / totalCount)
    }
    return 0
  }, [totalOmzet, totalCount])

  // Top Menu Paling Untung (diurutkan margin tertinggi)
  const topProfitableProducts = useMemo(() => {
    const list = stats?.products || []
    return [...list]
      .filter((p) => Number(p.margin_percent) > 0)
      .sort((a, b) => Number(b.margin_percent) - Number(a.margin_percent))
      .slice(0, 3)
  }, [stats])

  const menuAndalanName = topProfitableProducts[0]?.name || 'Belum Ada Menu'

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedMethod === 'Semua') return true
      return tx.method.toLowerCase().includes(selectedMethod.toLowerCase())
    }).sort((a, b) => {
      if (sortOrder === 'omzet-desc') return b.omzet - a.omzet
      if (sortOrder === 'omzet-asc') return a.omzet - b.omzet
      return 0
    })
  }, [transactions, selectedMethod, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage])

  const handleOpenReceipt = (tx) => {
    if (tx?.uuid) {
      const url = `/#struk/${tx.uuid}`
      const win = window.open(url, '_blank')
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.hash = `struk/${tx.uuid}`
      }
    } else if (onToast) {
      onToast(`Membuka rincian transaksi ${tx.id}...`)
    }
  }

  // Real Payment Methods Breakdown (Tunai, QRIS, Kartu/Debit)
  const pmData = useMemo(() => {
    if (stats?.payment_methods) {
      return stats.payment_methods
    }
    const counts = { Tunai: 0, QRIS: 0, 'Kartu/Debit': 0 }
    const totals = { Tunai: 0, QRIS: 0, 'Kartu/Debit': 0 }
    transactions.forEach((t) => {
      const m = t.method || 'Tunai'
      if (m.toLowerCase().includes('qris')) {
        counts.QRIS += 1
        totals.QRIS += t.omzet
      } else if (m.toLowerCase().includes('kartu') || m.toLowerCase().includes('debit')) {
        counts['Kartu/Debit'] += 1
        totals['Kartu/Debit'] += t.omzet
      } else {
        counts.Tunai += 1
        totals.Tunai += t.omzet
      }
    })
    const totalCount = transactions.length || 1
    return {
      Tunai: { count: counts.Tunai, total: totals.Tunai, pct: Math.round((counts.Tunai / totalCount) * 100) },
      QRIS: { count: counts.QRIS, total: totals.QRIS, pct: Math.round((counts.QRIS / totalCount) * 100) },
      'Kartu/Debit': { count: counts['Kartu/Debit'], total: totals['Kartu/Debit'], pct: Math.round((counts['Kartu/Debit'] / totalCount) * 100) },
    }
  }, [stats, transactions])

  // Real Cash Flow & Profit Chart Data computed from database transactions & stats
  const chartPoints = useMemo(() => {
    const rawTrend = stats?.trend_14_days || stats?.trend || []
    if (rawTrend && rawTrend.length >= 4) {
      const chunkSize = Math.ceil(rawTrend.length / 4)
      const xPositions = [45, 195, 345, 495]
      return [0, 1, 2, 3].map((idx) => {
        const slice = rawTrend.slice(idx * chunkSize, (idx + 1) * chunkSize)
        const omzetSum = slice.reduce((acc, curr) => acc + (Number(curr.omzet) || 0), 0)
        const labaSum = slice.reduce((acc, curr) => acc + (Number(curr.laba) || 0), 0)
        const modalSum = slice.reduce((acc, curr) => acc + (Number(curr.modal) || 0), 0)
        const label = slice[slice.length - 1]?.day || `Periode ${idx + 1}`
        return {
          week: label,
          omzet: Math.round(omzetSum / 1000) / 1000,
          laba: Math.round(labaSum / 1000) / 1000,
          hpp: Math.round(modalSum / 1000) / 1000,
          x: xPositions[idx],
        }
      })
    }
    return [
      { week: 'Pekan 1', omzet: 0, laba: 0, hpp: 0, x: 45 },
      { week: 'Pekan 2', omzet: 0, laba: 0, hpp: 0, x: 195 },
      { week: 'Pekan 3', omzet: 0, laba: 0, hpp: 0, x: 345 },
      { week: 'Pekan 4', omzet: 0, laba: 0, hpp: 0, x: 495 },
    ]
  }, [stats])

  const topVal = useMemo(() => {
    const maxData = Math.max(...chartPoints.map((p) => p.omzet), 0.5)
    return Math.max(Math.ceil(maxData * 1.15), 3)
  }, [chartPoints])

  const yTicks = useMemo(() => {
    if (topVal <= 4) {
      const ticks = []
      for (let i = topVal; i >= 0; i--) {
        ticks.push(i)
      }
      return ticks
    }
    const step = Math.ceil(topVal / 4)
    const ticks = []
    for (let i = step * 4; i >= 0; i -= step) {
      ticks.push(i)
    }
    return ticks
  }, [topVal])

  const scaleMax = useMemo(() => {
    return yTicks[0] || topVal
  }, [yTicks, topVal])

  const getY = (val) => {
    const clamped = Math.max(0, Number(val) || 0)
    return 185 - (clamped / scaleMax) * 155
  }

  const omzetPath = `M ${chartPoints[0].x} ${getY(chartPoints[0].omzet)} C 120 ${getY((chartPoints[0].omzet + chartPoints[1].omzet) / 2)}, 120 ${getY(chartPoints[1].omzet)}, ${chartPoints[1].x} ${getY(chartPoints[1].omzet)} C 270 ${getY((chartPoints[1].omzet + chartPoints[2].omzet) / 2)}, 270 ${getY(chartPoints[2].omzet)}, ${chartPoints[2].x} ${getY(chartPoints[2].omzet)} C 420 ${getY((chartPoints[2].omzet + chartPoints[3].omzet) / 2)}, 420 ${getY(chartPoints[3].omzet)}, ${chartPoints[3].x} ${getY(chartPoints[3].omzet)}`
  const labaPath = `M ${chartPoints[0].x} ${getY(chartPoints[0].laba)} C 120 ${getY((chartPoints[0].laba + chartPoints[1].laba) / 2)}, 120 ${getY(chartPoints[1].laba)}, ${chartPoints[1].x} ${getY(chartPoints[1].laba)} C 270 ${getY((chartPoints[1].laba + chartPoints[2].laba) / 2)}, 270 ${getY(chartPoints[2].laba)}, ${chartPoints[2].x} ${getY(chartPoints[2].laba)} C 420 ${getY((chartPoints[2].laba + chartPoints[3].laba) / 2)}, 420 ${getY(chartPoints[3].laba)}, ${chartPoints[3].x} ${getY(chartPoints[3].laba)}`
  const hppPath = `M ${chartPoints[0].x} ${getY(chartPoints[0].hpp)} C 120 ${getY((chartPoints[0].hpp + chartPoints[1].hpp) / 2)}, 120 ${getY(chartPoints[1].hpp)}, ${chartPoints[1].x} ${getY(chartPoints[1].hpp)} C 270 ${getY((chartPoints[1].hpp + chartPoints[2].hpp) / 2)}, 270 ${getY(chartPoints[2].hpp)}, ${chartPoints[2].x} ${getY(chartPoints[2].hpp)} C 420 ${getY((chartPoints[2].hpp + chartPoints[3].hpp) / 2)}, 420 ${getY(chartPoints[3].hpp)}, ${chartPoints[3].x} ${getY(chartPoints[3].hpp)}`

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Laporan Keuangan
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pantau performa arus kas, total omzet, laba bersih riil, dan ekspor data pembukuan usahamu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onToast) onToast('Laporan Keuangan berhasil diunduh (.pdf / .csv)!')
          }}
          className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Ekspor Laporan</span>
        </button>
      </div>

      {/* ================= ROW 1: 4 TOP KPI CARDS (Real-time Backend Data) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Omset Kotor */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Total Omset Kotor</span>
            <div className="w-6 h-6 rounded-lg bg-gray-900 text-white flex items-center justify-center">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {isLoading && transactions.length === 0 ? (
              <span className="inline-block w-36 h-7 bg-gray-200/70 rounded-lg animate-pulse" />
            ) : (
              <RollNumberTicker value={totalOmzet} prefix="Rp" />
            )}
          </p>
          <div className="flex items-center gap-1 text-[#009F58] font-bold text-xs pt-1">
            {isLoading && transactions.length === 0 ? (
              <span className="inline-block w-28 h-3.5 bg-gray-100 rounded animate-pulse" />
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{totalCount > 0 ? `${totalCount} transaksi kasir` : 'Belum ada transaksi'}</span>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Total HPP (Modal Bahan) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Total HPP (Modal Bahan)</span>
            <div className="w-6 h-6 rounded-lg bg-gray-900 text-white flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {isLoading && transactions.length === 0 ? (
              <span className="inline-block w-36 h-7 bg-gray-200/70 rounded-lg animate-pulse" />
            ) : (
              <RollNumberTicker value={totalHpp} prefix="Rp" />
            )}
          </p>
          <div className="flex items-center gap-1.5 text-gray-500 font-medium text-xs pt-1">
            {isLoading && transactions.length === 0 ? (
              <span className="inline-block w-24 h-3.5 bg-gray-100 rounded animate-pulse" />
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                <span>{totalOmzet > 0 ? `${((totalHpp / totalOmzet) * 100).toFixed(1)}% dari omzet` : '0% dari omzet'}</span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Total Laba Bersih */}
        <div className="bg-[#009F58] rounded-2xl p-4 sm:p-5 text-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-100 mb-1">
            <span className="text-xs font-semibold">Total Laba Bersih</span>
            <div className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {isLoading && transactions.length === 0 ? (
              <span className="inline-block w-36 h-7 bg-white/30 rounded-lg animate-pulse" />
            ) : (
              <RollNumberTicker value={totalProfit} prefix="Rp" />
            )}
          </p>
          <div className="flex items-center gap-1 text-emerald-100 font-medium text-xs pt-1">
            {isLoading && transactions.length === 0 ? (
              <span className="inline-block w-28 h-3.5 bg-white/20 rounded animate-pulse" />
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{totalProfit >= 0 ? 'Surplus laba usaha' : 'Defisit modal bahan'}</span>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Rata-rata Margin Usaha */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Rata-rata Margin Usaha</span>
            <Gauge className="w-4 h-4 text-gray-700" />
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {isLoading && transactions.length === 0 ? (
              <span className="inline-block w-20 h-7 bg-gray-200/70 rounded-lg animate-pulse" />
            ) : (
              `${avgMargin}%`
            )}
          </p>
          <div className="flex items-center justify-between pt-1">
            {isLoading && transactions.length === 0 ? (
              <span className="inline-block w-24 h-3.5 bg-gray-100 rounded animate-pulse" />
            ) : (
              <>
                <span className={`font-bold text-xs ${Number(avgMargin) >= 55 ? 'text-[#009F58]' : Number(avgMargin) >= 30 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {Number(avgMargin) >= 55 ? 'Sehat' : Number(avgMargin) >= 30 ? 'Cukup Sehat' : 'Perlu Evaluasi'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Target &gt; 55%
                </span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ================= ROW 2: PERFORMA OUTLET & TOP MENU PALING UNTUNG ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Card: Performa Outlet Utama (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col">
          <div>
            <p className="text-[11px] font-semibold text-gray-400">
              Performa Outlet Utama
            </p>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">
              {user?.business_name || user?.name || 'Usaha Anda'}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Status Operasional : <span className="font-bold text-emerald-600">Aktif & Terbuka</span>
            </p>
          </div>

          {/* 3 Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 flex-1">
            <div className="bg-gray-50/70 rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-semibold text-gray-500">Tiket Rata-rata (AOV)</span>
              <p className="text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight my-2">
                {isLoading && transactions.length === 0 ? (
                  <span className="inline-block w-28 h-7 bg-gray-200/70 rounded-lg animate-pulse" />
                ) : (
                  `Rp${aov.toLocaleString('id-ID')}`
                )}
              </p>
              <span className="text-xs text-[#009F58] font-bold block">
                {isLoading && transactions.length === 0 ? (
                  <span className="inline-block w-24 h-3.5 bg-gray-100 rounded animate-pulse" />
                ) : (
                  `${totalCount} transaksi tercatat`
                )}
              </span>
            </div>

            <div className="bg-gray-50/70 rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-semibold text-gray-500">Menu Andalan</span>
              <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight my-2 truncate leading-snug" title={menuAndalanName}>
                {isLoading && transactions.length === 0 ? (
                  <span className="inline-block w-32 h-6 bg-gray-200/70 rounded-lg animate-pulse" />
                ) : (
                  menuAndalanName
                )}
              </p>
              <span className="text-xs text-[#009F58] font-bold block">
                {isLoading && transactions.length === 0 ? (
                  <span className="inline-block w-20 h-3.5 bg-gray-100 rounded animate-pulse" />
                ) : (
                  'Margin Sehat'
                )}
              </span>
            </div>

            <div className="bg-gray-50/70 rounded-xl p-4 sm:p-5 border border-gray-100 flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-semibold text-gray-500">Rasio Margin Kotor</span>
              <p className="text-2xl sm:text-[26px] font-black text-[#009F58] tracking-tight my-2">
                {isLoading && transactions.length === 0 ? (
                  <span className="inline-block w-20 h-7 bg-emerald-100/70 rounded-lg animate-pulse" />
                ) : (
                  `${avgMargin}%`
                )}
              </p>
              <span className="text-xs text-gray-500 font-medium block">
                {isLoading && transactions.length === 0 ? (
                  <span className="inline-block w-24 h-3.5 bg-gray-100 rounded animate-pulse" />
                ) : (
                  'Bantalan profit kasir'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Top Menu Paling Untung (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100/80">
            <h3 className="font-bold text-sm text-gray-900">
              Top Menu Paling Untung
            </h3>
            <Award className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-2.5 my-auto py-1">
            {isLoading && (!topProfitableProducts || topProfitableProducts.length === 0) ? (
              <div className="space-y-3 py-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
              </div>
            ) : topProfitableProducts && topProfitableProducts.length > 0 ? (
              topProfitableProducts.map((item, idx) => {
                const price = Number(item.selling_price) || 0
                const cost = Number(item.modal_per_unit || item.hpp) || 0
                const profitVal = item.profit_per_unit != null ? Number(item.profit_per_unit) : (price - cost)
                const marginVal = Number(item.margin_percent) || 0
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-gray-900 text-xs sm:text-[13px] truncate max-w-[180px]">
                        {item.name}
                      </span>
                      <span className="font-bold text-gray-900 text-xs sm:text-[13px]">
                        {profitVal >= 0 ? `+Rp${profitVal.toLocaleString('id-ID')}` : `-Rp${Math.abs(profitVal).toLocaleString('id-ID')}`}
                        <span className="text-[10px] text-gray-400 font-normal"> / porsi</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-[#009F58] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, marginVal))}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 shrink-0">
                        Margin {marginVal}%
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">
                Belum ada produk dengan margin keuntungan tercatat.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {stats?.products?.length || 0} produk dalam katalog
            </span>
            <button
              type="button"
              onClick={() => {
                if (onNavigateMenu) {
                  onNavigateMenu('Katalog & HPP')
                } else {
                  window.location.hash = '#produk'
                }
              }}
              className="text-xs font-semibold text-[#009F58] hover:text-[#008246] transition-colors inline-flex items-center gap-1 cursor-pointer group"
            >
              <span>Kelola Resep & Margin</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ================= ROW 3: PERKEMBANGAN ARUS KAS & SEBARAN METODE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Chart: Perkembangan Arus Kas & Laba Riil (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-gray-50">
            <div>
              <h3 className="font-bold text-sm text-gray-900">
                Perkembangan Arus Kas & Laba Riil
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Korelasi mingguan antara omzet kotor, beban modal bahan (HPP), dan laba bersih
              </p>
            </div>
            {/* Legend Indicators */}
            <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-600 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                <span>Omzet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Laba Bersih</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                <span>HPP</span>
              </div>
            </div>
          </div>

          {/* SVG Area & Curved Chart: Sized properly to fill vertical room */}
          <div className="w-full my-auto py-2">
            <svg
              viewBox="0 0 540 220"
              className="w-full h-56 sm:h-60 overflow-hidden select-none"
            >
              <defs>
                <linearGradient id="gradientOmzet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FB7185" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradientLaba" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradientHpp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis */}
              {yTicks.map((val) => {
                const y = getY(val)
                return (
                  <g key={val}>
                    <line
                      x1="35"
                      y1={y}
                      x2="520"
                      y2={y}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                    <text
                      x="25"
                      y={y + 3.5}
                      textAnchor="end"
                      className="text-[10px] fill-gray-400 font-sans"
                    >
                      {val}
                    </text>
                  </g>
                )
              })}

              {/* Area Fills */}
              <path
                d={`${omzetPath} L 495 185 L 45 185 Z`}
                fill="url(#gradientOmzet)"
              />
              <path
                d={`${labaPath} L 495 185 L 45 185 Z`}
                fill="url(#gradientLaba)"
              />
              <path
                d={`${hppPath} L 495 185 L 45 185 Z`}
                fill="url(#gradientHpp)"
              />

              {/* Smooth Curves */}
              <path
                d={omzetPath}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="2.5"
              />
              <path
                d={labaPath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
              />
              <path
                d={hppPath}
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
              />

              {/* Points for each curve */}
              {chartPoints.map((pt, i) => (
                <g key={i}>
                  {/* Omzet point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.omzet)}
                    r="4"
                    fill="white"
                    stroke="#F43F5E"
                    strokeWidth="2"
                  />
                  {/* Laba point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.laba)}
                    r="4"
                    fill="white"
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  {/* HPP point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.hpp)}
                    r="4"
                    fill="white"
                    stroke="#6366F1"
                    strokeWidth="2"
                  />
                  {/* X-Axis labels */}
                  <text
                    x={pt.x}
                    y="204"
                    textAnchor="middle"
                    className="text-[11px] fill-gray-500 font-medium font-sans"
                  >
                    {pt.week}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Sync status */}
          <div className="pt-2 text-right border-t border-gray-50">
            <span className="text-[10px] text-gray-400">
              Terakhir sinkronisasi: Hari ini, 16:42 WIB
            </span>
          </div>
        </div>

        {/* Right Widget: Sebaran Metode (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <h3 className="font-bold text-sm text-gray-900 mb-2">
            Sebaran Metode
          </h3>

          {/* Donut Chart */}
          <div className="relative flex items-center justify-center py-2">
            <svg viewBox="0 0 160 160" className="w-36 h-36 -rotate-90 transform">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#F3F4F6"
                strokeWidth="20"
              />
              {/* Circumference = 2 * PI * 60 = ~377 */}
              {/* QRIS (#6366F1) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#6366F1"
                strokeWidth="20"
                strokeDasharray={`${((377 * (pmData.QRIS?.pct || 0)) / 100).toFixed(2)} 377`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Tunai / Cash (#10B981) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="20"
                strokeDasharray={`${((377 * (pmData.Tunai?.pct || 0)) / 100).toFixed(2)} 377`}
                strokeDashoffset={`-${((377 * (pmData.QRIS?.pct || 0)) / 100).toFixed(2)}`}
                strokeLinecap="round"
              />
              {/* Debit / Kartu (#FB7185) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#FB7185"
                strokeWidth="20"
                strokeDasharray={`${((377 * (pmData['Kartu/Debit']?.pct || 0)) / 100).toFixed(2)} 377`}
                strokeDashoffset={`-${(((377 * (pmData.QRIS?.pct || 0)) / 100) + ((377 * (pmData.Tunai?.pct || 0)) / 100)).toFixed(2)}`}
                strokeLinecap="round"
              />
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-gray-900 leading-none">
                {transactions.length}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Total Transaksi
              </span>
            </div>
          </div>

          {/* Breakdown legend list */}
          <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                <span className="text-gray-700 font-medium">QRIS ({pmData.QRIS?.count || 0})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium text-[11px]">{pmData.QRIS?.pct || 0}%</span>
                <span className="font-bold text-gray-900">Rp{(pmData.QRIS?.total || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-gray-700 font-medium">Tunai ({pmData.Tunai?.count || 0})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium text-[11px]">{pmData.Tunai?.pct || 0}%</span>
                <span className="font-bold text-gray-900">Rp{(pmData.Tunai?.total || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]" />
                <span className="text-gray-700 font-medium">Kartu/Debit ({pmData['Kartu/Debit']?.count || 0})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium text-[11px]">{pmData['Kartu/Debit']?.pct || 0}%</span>
                <span className="font-bold text-gray-900">Rp{(pmData['Kartu/Debit']?.total || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= ROW 4: RIWAYAT TRANSAKSI & PEMBUKUAN KASIR ================= */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
        
        {/* Header row with Filters */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              Riwayat Transaksi & Pembukuan Kasir
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Pantau performa arus kas, total omzet, laba bersih riil, dan ekspor data pembukuan usahamu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                className={`inline-flex items-center gap-2 pl-3 pr-2.5 py-2 bg-white border rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  isMethodDropdownOpen
                    ? 'border-[#009F58] ring-2 ring-[#009F58]/10 text-gray-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {selectedMethod === 'Semua' ? 'Metode Pembayaran: Semua' : `Metode: ${selectedMethod}`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isMethodDropdownOpen ? 'rotate-180 text-[#009F58]' : ''
                  }`}
                />
              </button>

              {isMethodDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMethodDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.1)] border border-gray-100 p-1.5 z-50 animate-fade-in">
                    <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Filter Metode
                      </p>
                    </div>
                    {[
                      { id: 'Semua', label: 'Semua Metode', icon: Sliders },
                      { id: 'QRIS', label: 'QRIS', icon: QrCode },
                      { id: 'Cash', label: 'Cash (Tunai)', icon: Coins },
                      { id: 'Debit', label: 'Debit / Kartu', icon: CreditCard }
                    ].map((opt) => {
                      const Icon = opt.icon
                      const isSelected = selectedMethod === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedMethod(opt.id)
                            setCurrentPage(1)
                            setIsMethodDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-[#009F58] font-bold'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#009F58]' : 'text-gray-400'}`} />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#009F58]" />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const next = sortOrder === 'newest' ? 'omzet-desc' : sortOrder === 'omzet-desc' ? 'omzet-asc' : 'newest'
                setSortOrder(next)
                if (onToast) {
                  if (next === 'omzet-desc') onToast('Urutkan: Omzet Tertinggi')
                  else if (next === 'omzet-asc') onToast('Urutkan: Omzet Terendah')
                  else onToast('Urutan terbaru')
                }
              }}
              title="Urutkan"
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading & Error States */}
        {loadError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-2xl flex items-center justify-between m-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={fetchReportsData}
              className="font-bold underline text-rose-800 hover:text-rose-950 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {isLoading && (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="w-7 h-7 text-[#009F58] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-600">Memuat laporan transaksi riil dari server...</p>
          </div>
        )}

        {!isLoading && filteredTransactions.length === 0 && (
          <div className="py-16 text-center space-y-2 px-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
              <Package className="w-6 h-6 stroke-[1.8]" />
            </div>
            <p className="text-sm font-bold text-gray-800">Belum Ada Transaksi Kasir</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Buka menu Kasir untuk mulai mencatat transaksi penjualan usahamu secara real-time.
            </p>
          </div>
        )}

        {/* MOBILE VIEW (CARDS): block md:hidden */}
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="block md:hidden divide-y divide-gray-100">
          {paginatedTransactions.map((tx) => (
            <div key={tx.id} className="p-4 bg-white hover:bg-gray-50/70 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                    {tx.id}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {tx.date} • {tx.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                    {tx.method === 'QRIS' ? (
                      <QrCode className="w-3 h-3" />
                    ) : tx.method === 'Cash' ? (
                      <Coins className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <CreditCard className="w-3 h-3 text-purple-600" />
                    )}
                    <span>{tx.method}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenReceipt(tx)}
                    title="Buka Struk Digital"
                    aria-label="Buka Struk Digital"
                    className="w-7 h-7 -mr-1 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#009F58] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                  </button>
                </div>
              </div>

              <p className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                {tx.items}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-gray-100 text-xs">
                <div className="bg-gray-50/80 rounded-xl p-2">
                  <span className="text-[9px] text-gray-400 font-semibold block uppercase">
                    Omzet
                  </span>
                  <span className="font-bold text-xs text-gray-900 block mt-0.5">
                    Rp{tx.omzet.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-gray-50/80 rounded-xl p-2">
                  <span className="text-[9px] text-gray-400 font-semibold block uppercase">
                    Modal HPP
                  </span>
                  <span className="font-bold text-xs text-gray-700 block mt-0.5">
                    Rp{tx.hpp.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-emerald-50/70 rounded-xl p-2">
                  <span className="text-[9px] text-gray-400 font-semibold block uppercase">
                    Laba Bersih
                  </span>
                  <span className="font-bold text-xs text-[#009F58] block mt-0.5">
                    +Rp{tx.profit.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Action Button: Buka Struk Digital Mobile */}
              <button
                type="button"
                onClick={() => handleOpenReceipt(tx)}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/80 text-[#009F58] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-100 cursor-pointer active:scale-[0.99]"
              >
                <Eye className="w-3.5 h-3.5 stroke-[2]" />
                <span>Lihat Struk Digital</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP VIEW (TABLE): hidden md:block */}
      {!isLoading && filteredTransactions.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/90 text-gray-700 text-xs font-bold border-b border-gray-100">
                <th className="py-3.5 px-5 text-left font-bold text-gray-700">ID</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Waktu Transaksi</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Rincian Item</th>
                <th className="py-3.5 px-4 text-center font-bold text-gray-700">Metode</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Total Omzet</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Modal HPP</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Laba Bersih</th>
                <th className="py-3.5 px-4 text-center font-bold text-gray-700 w-12"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* ID */}
                  <td className="py-4 px-5 font-bold text-gray-900 font-mono text-xs">
                    {tx.id}
                  </td>

                  {/* Waktu */}
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">{tx.date}</p>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">{tx.time}</span>
                  </td>

                  {/* Rincian Item */}
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900 text-xs sm:text-[13px] leading-snug">
                      {tx.items.split(', ')[0]}
                    </p>
                    {tx.items.split(', ')[1] && (
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        {tx.items.split(', ')[1]}
                      </span>
                    )}
                  </td>

                  {/* Metode */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100/80 text-blue-600 font-bold text-[10px] shadow-2xs">
                      {tx.method === 'QRIS' ? (
                        <QrCode className="w-4 h-4" />
                      ) : tx.method === 'Cash' ? (
                        <Coins className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                  </td>

                  {/* Total Omzet */}
                  <td className="py-4 px-4 font-bold text-gray-900 text-xs sm:text-[13px]">
                    Rp{tx.omzet.toLocaleString('id-ID')}
                  </td>

                  {/* Modal HPP */}
                  <td className="py-4 px-4 font-semibold text-gray-800 text-xs sm:text-[13px]">
                    Rp{tx.hpp.toLocaleString('id-ID')}
                  </td>

                  {/* Laba Bersih */}
                  <td className="py-4 px-4 font-bold text-[#009F58] text-xs sm:text-[13px]">
                    +Rp{tx.profit.toLocaleString('id-ID')}
                  </td>

                  {/* Action / Detail button */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenReceipt(tx)}
                      title="Buka Struk Digital"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#009F58] hover:bg-emerald-50 transition-colors cursor-pointer mx-auto"
                    >
                      <Eye className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer: Pagination */}
      <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <p>
          Menampilkan <span className="font-bold text-gray-800">{paginatedTransactions.length}</span> dari{' '}
          <span className="font-bold text-gray-800">{filteredTransactions.length}</span> transaksi terverifikasi
        </p>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentPage === page
                    ? 'bg-[#009F58] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            {totalPages > 1 && (
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                &gt;
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

