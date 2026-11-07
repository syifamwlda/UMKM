import React, { useState, useMemo } from 'react'
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
  Coins
} from 'lucide-react'

// Mock transaction history dataset
const INITIAL_TRANSACTIONS = [
  {
    id: 'TX0554',
    date: '01 Nov 2026',
    time: '14:20 WIB',
    items: '2x Kopi Susu Gula Aren, 1x Croissant Butter',
    method: 'QRIS',
    omzet: 73000,
    hpp: 44100,
    profit: 28900
  },
  {
    id: 'TX0553',
    date: '01 Nov 2026',
    time: '13:45 WIB',
    items: '1x Cold Brew Coffee, 1x Almond Croissant',
    method: 'Cash',
    omzet: 42000,
    hpp: 19700,
    profit: 22300
  },
  {
    id: 'TX0552',
    date: '01 Nov 2026',
    time: '12:15 WIB',
    items: '3x Cafe Latte Gayo, 2x Roti Bakar Coklat',
    method: 'QRIS',
    omzet: 98000,
    hpp: 55700,
    profit: 42300
  },
  {
    id: 'TX0551',
    date: '01 Nov 2026',
    time: '11:30 WIB',
    items: '1x Matcha Latte Kyoto, 1x Croissant Cokelat',
    method: 'Debit/Kartu',
    omzet: 34000,
    hpp: 25500,
    profit: 8500
  },
  {
    id: 'TX0550',
    date: '01 Nov 2026',
    time: '10:05 WIB',
    items: '2x Kopi Susu Gula Aren',
    method: 'QRIS',
    omzet: 36000,
    hpp: 10000,
    profit: 26000
  },
  {
    id: 'TX0549',
    date: '01 Nov 2026',
    time: '09:15 WIB',
    items: '1x Spaghetti Aglio Olio, 1x Cold Brew Coffee',
    method: 'Cash',
    omzet: 53000,
    hpp: 29400,
    profit: 23600
  }
]

export default function LaporanKeuanganPage({ onToast }) {
  // Filters & Pagination
  const [selectedMethod, setSelectedMethod] = useState('Semua')
  const [sortOrder, setSortOrder] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  // Chart hover state
  const [hoveredWeek, setHoveredWeek] = useState(null)

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return INITIAL_TRANSACTIONS.filter((tx) => {
      if (selectedMethod === 'Semua') return true
      return tx.method.toLowerCase().includes(selectedMethod.toLowerCase())
    }).sort((a, b) => {
      if (sortOrder === 'omzet-desc') return b.omzet - a.omzet
      if (sortOrder === 'omzet-asc') return a.omzet - b.omzet
      return 0
    })
  }, [selectedMethod, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(start, start + itemsPerPage)
  }, [filteredTransactions, currentPage])

  // Weekly Cash Flow & Real Profit Chart Data (Minggu 1 - 4)
  // Coordinates for 4 weeks on SVG viewBox: 0 0 540 180
  const chartPoints = [
    { week: 'Minggu 1', omzet: 4.2, laba: 2.8, hpp: 1.4, x: 40 },
    { week: 'Minggu 2', omzet: 4.8, laba: 3.3, hpp: 1.5, x: 190 },
    { week: 'Minggu 3', omzet: 5.1, laba: 3.5, hpp: 1.6, x: 340 },
    { week: 'Minggu 4', omzet: 5.4, laba: 3.7, hpp: 1.7, x: 490 }
  ]

  // Y-Scale: 0 to 6 jt maps to Y 160 to 20 (height: 140px)
  const getY = (val) => 160 - (val / 6) * 140

  const omzetPath = `M ${chartPoints[0].x} ${getY(chartPoints[0].omzet)} C 115 ${getY(4.5)}, 115 ${getY(4.8)}, ${chartPoints[1].x} ${getY(chartPoints[1].omzet)} C 265 ${getY(4.9)}, 265 ${getY(5.1)}, ${chartPoints[2].x} ${getY(chartPoints[2].omzet)} C 415 ${getY(5.2)}, 415 ${getY(5.4)}, ${chartPoints[3].x} ${getY(chartPoints[3].omzet)}`
  const labaPath = `M ${chartPoints[0].x} ${getY(chartPoints[0].laba)} C 115 ${getY(3.0)}, 115 ${getY(3.3)}, ${chartPoints[1].x} ${getY(chartPoints[1].laba)} C 265 ${getY(3.4)}, 265 ${getY(3.5)}, ${chartPoints[2].x} ${getY(chartPoints[2].laba)} C 415 ${getY(3.6)}, 415 ${getY(3.7)}, ${chartPoints[3].x} ${getY(chartPoints[3].laba)}`
  const hppPath = `M ${chartPoints[0].x} ${getY(chartPoints[0].hpp)} C 115 ${getY(1.45)}, 115 ${getY(1.5)}, ${chartPoints[1].x} ${getY(chartPoints[1].hpp)} C 265 ${getY(1.55)}, 265 ${getY(1.6)}, ${chartPoints[2].x} ${getY(chartPoints[2].hpp)} C 415 ${getY(1.65)}, 415 ${getY(1.7)}, ${chartPoints[3].x} ${getY(chartPoints[3].hpp)}`

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

      {/* ================= ROW 1: 4 TOP KPI CARDS ================= */}
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
            Rp19.500.000
          </p>
          <div className="flex items-center gap-1 text-[#009F58] font-bold text-xs pt-1">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>7% dari bulan lalu</span>
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
            Rp6.240.000
          </p>
          <div className="flex items-center gap-1.5 text-gray-500 font-medium text-xs pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            <span>32% dari omzet</span>
          </div>
        </div>

        {/* Card 3: Total Laba Bersih (Solid Brand Green Card) */}
        <div className="bg-[#009F58] rounded-2xl p-4 sm:p-5 text-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-100 mb-1">
            <span className="text-xs font-semibold">Total Laba Bersih</span>
            <div className="w-6 h-6 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            Rp13.260.000
          </p>
          <div className="flex items-center gap-1 text-emerald-100 font-medium text-xs pt-1">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+18% dari bulan lalu</span>
          </div>
        </div>

        {/* Card 4: Rata-rata Margin Usaha */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Rata-rata Margin Usaha</span>
            <Gauge className="w-4 h-4 text-gray-700" />
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            68,0%
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-xs text-[#009F58]">
              Sehat
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Target &gt; 55%
            </span>
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
              Kedai Kopi Nabila
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Target Bulanan Tercapai : <span className="font-bold text-gray-800">112%</span>
            </p>
          </div>

          {/* 3 Stats Grid: Fills remaining height cleanly with no awkward bottom gap */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 flex-1">
            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
              <span className="text-xs font-medium text-gray-500">Tiket Rata-rata (AOV)</span>
              <p className="text-lg font-black text-gray-900 mt-1">Rp42.500</p>
              <span className="text-[11px] text-[#009F58] font-bold block mt-0.5">
                +4.2% per transaksi
              </span>
            </div>

            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
              <span className="text-xs font-medium text-gray-500">Produk Terlaris</span>
              <p className="text-lg font-black text-gray-900 mt-1 truncate">
                Kopi Susu Aren
              </p>
              <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                384 porsi terjual
              </span>
            </div>

            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
              <span className="text-xs font-medium text-gray-500">Rasio Efisiensi Bahan</span>
              <p className="text-lg font-black text-[#009F58] mt-1">98.4%</p>
              <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                Waste terukur 1.6%
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Top Menu Paling Untung (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100/80">
            <h3 className="font-bold text-sm text-gray-900">
              Top Menu Paling Untung
            </h3>
            <Award className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-3.5 my-3">
            {/* Item 1 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-gray-900 text-xs sm:text-[13px]">
                  Kopi Susu Gula Aren
                </span>
                <span className="font-bold text-gray-900 text-xs sm:text-[13px]">
                  +Rp18.000 <span className="text-[10px] text-gray-400 font-normal">/ cup</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#009F58] rounded-full transition-all duration-500" style={{ width: '72%' }} />
                </div>
                <span className="text-xs font-semibold text-gray-600 shrink-0">
                  Margin 72%
                </span>
              </div>
            </div>

            {/* Item 2 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-gray-900 text-xs sm:text-[13px]">
                  Cold Brew Coffee
                </span>
                <span className="font-bold text-gray-900 text-xs sm:text-[13px]">
                  +Rp24.000 <span className="text-[10px] text-gray-400 font-normal">/ cup</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#009F58] rounded-full transition-all duration-500" style={{ width: '62%' }} />
                </div>
                <span className="text-xs font-semibold text-gray-600 shrink-0">
                  Margin 62%
                </span>
              </div>
            </div>

            {/* Item 3 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-gray-900 text-xs sm:text-[13px]">
                  Matcha Latte Kyoto
                </span>
                <span className="font-bold text-gray-900 text-xs sm:text-[13px]">
                  +Rp19.600 <span className="text-[10px] text-gray-400 font-normal">/ cup</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#009F58] rounded-full transition-all duration-500" style={{ width: '65%' }} />
                </div>
                <span className="text-xs font-semibold text-gray-600 shrink-0">
                  Margin 65%
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              3 produk margin tertinggi
            </span>
            <button
              type="button"
              onClick={() => {
                if (onToast) onToast('Beralih ke analisis detail margin produk...')
              }}
              className="text-xs font-semibold text-[#009F58] hover:text-[#008246] transition-colors inline-flex items-center gap-1 cursor-pointer group"
            >
              <span>Analisis Margin Produk</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ================= ROW 3: PERKEMBANGAN ARUS KAS & SEBARAN METODE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Chart: Perkembangan Arus Kas & Laba Riil (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900">
              Perkembangan Arus Kas & Laba Riil
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Korelasi mingguan antara omzet kotor, beban modal bahan (HPP), dan laba bersih
            </p>
          </div>

          {/* SVG Area & Curved Chart */}
          <div className="w-full mt-4">
            <svg
              viewBox="0 0 540 180"
              className="w-full h-44 overflow-visible select-none"
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
              {[6, 5, 4, 3, 2, 1, 0].map((val) => {
                const y = getY(val)
                return (
                  <g key={val}>
                    <line
                      x1="30"
                      y1={y}
                      x2="520"
                      y2={y}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                    <text
                      x="20"
                      y={y + 3}
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
                d={`${omzetPath} L 490 160 L 40 160 Z`}
                fill="url(#gradientOmzet)"
              />
              <path
                d={`${labaPath} L 490 160 L 40 160 Z`}
                fill="url(#gradientLaba)"
              />
              <path
                d={`${hppPath} L 490 160 L 40 160 Z`}
                fill="url(#gradientHpp)"
              />

              {/* Smooth Curves */}
              <path
                d={omzetPath}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="2"
              />
              <path
                d={labaPath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
              />
              <path
                d={hppPath}
                fill="none"
                stroke="#6366F1"
                strokeWidth="2"
              />

              {/* Points for each curve */}
              {chartPoints.map((pt, i) => (
                <g key={i}>
                  {/* Omzet point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.omzet)}
                    r="3.5"
                    fill="white"
                    stroke="#F43F5E"
                    strokeWidth="2"
                  />
                  {/* Laba point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.laba)}
                    r="3.5"
                    fill="white"
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  {/* HPP point */}
                  <circle
                    cx={pt.x}
                    cy={getY(pt.hpp)}
                    r="3.5"
                    fill="white"
                    stroke="#6366F1"
                    strokeWidth="2"
                  />
                  {/* X-Axis labels */}
                  <text
                    x={pt.x}
                    y="176"
                    textAnchor="middle"
                    className="text-[11px] fill-gray-500 font-sans"
                  >
                    {pt.week}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Sync status */}
          <div className="pt-2 text-right">
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
              {/* Purple (QRIS - 55%) -> 377 * 0.55 = 207.35 */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#6366F1"
                strokeWidth="20"
                strokeDasharray="207.35 377"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Emerald (Cash - 40%) -> 377 * 0.40 = 150.8 */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="20"
                strokeDasharray="150.8 377"
                strokeDashoffset="-207.35"
                strokeLinecap="round"
              />
              {/* Coral (Debit - 5%) -> 377 * 0.05 = 18.85 */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#FB7185"
                strokeWidth="20"
                strokeDasharray="18.85 377"
                strokeDashoffset="-358.15"
                strokeLinecap="round"
              />
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-gray-900 leading-none">
                142
              </span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                100% Lunas
              </span>
            </div>
          </div>

          {/* Breakdown legend list */}
          <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                <span className="text-gray-700 font-medium">Qris</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium text-[11px]">55%</span>
                <span className="font-bold text-gray-900">Rp10.725.000</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-gray-700 font-medium">Cash</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium text-[11px]">40%</span>
                <span className="font-bold text-gray-900">Rp7.800.000</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]" />
                <span className="text-gray-700 font-medium">Debit/Kartu</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium text-[11px]">5%</span>
                <span className="font-bold text-gray-900">Rp975.000</span>
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
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value)
                  setCurrentPage(1)
                }}
                className="appearance-none pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#009F58] cursor-pointer"
              >
                <option value="Semua">Metode Pembayaran: Semua</option>
                <option value="QRIS">Metode: QRIS</option>
                <option value="Cash">Metode: Cash</option>
                <option value="Debit">Metode: Debit/Kartu</option>
              </select>
              <Sliders className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

        {/* Transactions Table: Subtle light gray header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                      onClick={() => {
                        if (onToast) onToast(`Membuka rincian transaksi ${tx.id}...`)
                      }}
                      title="Lihat Rincian"
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

        {/* Table Footer: Pagination */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            Menampilkan <span className="font-bold text-gray-800">{paginatedTransactions.length}</span> dari{' '}
            <span className="font-bold text-gray-800">142</span> transaksi terverifikasi
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

