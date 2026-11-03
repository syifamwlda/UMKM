import React, { useState } from 'react'
import {
  LayoutGrid,
  Store,
  Calculator,
  BarChart3,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Calendar,
  Plus,
  ArrowUpRight,
  Send,
  Menu,
  X,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Coffee,
  Croissant
} from 'lucide-react'

export default function DashboardPage({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [chartFilter, setChartFilter] = useState({ omzet: true, laba: true })
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswers, setAiAnswers] = useState([])
  const [toastMessage, setToastMessage] = useState('')
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(null)
  
  // Interactive product list
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Croissant Cokelat',
      category: 'Pastry • Fresh Bake',
      hpp: 10500,
      price: 10000,
      status: 'Rugi',
      icon: 'croissant'
    },
    {
      id: 2,
      name: 'Es Kopi Milkshake',
      category: 'Beverage • Cold Drink',
      hpp: 11200,
      price: 13000,
      status: 'Tipis',
      icon: 'coffee'
    }
  ])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleAdjustCroissantPrice = () => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === 1 ? { ...item, price: 13000, status: 'Sehat' } : item
      )
    )
    showToast('Harga Croissant Cokelat berhasil disesuaikan ke Rp13.000!')
  }

  const handleAskAi = (e) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return

    const question = aiQuestion.trim()
    setAiQuestion('')
    showToast(`AI sedang menganalisis: "${question}"...`)
    
    setTimeout(() => {
      showToast('Saran AI: Tingkatkan promosi bundling Kopi + Croissant untuk margin +28%!')
    }, 1200)
  }

  const handleSavePriceEdit = (id, newHpp, newPrice) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const margin = newPrice - newHpp
          let status = 'Sehat'
          if (margin < 0) status = 'Rugi'
          else if (margin < 2000) status = 'Tipis'
          return { ...item, hpp: Number(newHpp), price: Number(newPrice), status }
        }
        return item
      })
    )
    setShowEditModal(null)
    showToast('Data produk berhasil diperbarui!')
  }

  const menuUtama = [
    { name: 'Dashboard', icon: LayoutGrid },
    { name: 'Kasir', icon: Store },
    { name: 'Kalkulator HPP', icon: Calculator },
    { name: 'Laporan Keuangan', icon: BarChart3 },
    { name: 'Asisten AI', icon: Sparkles },
  ]

  const menuUmum = [
    { name: 'Pengaturan Toko', icon: Settings },
    { name: 'Help', icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-gray-900 flex antialiased selection:bg-[#009B5B]/15">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900/95 backdrop-blur-md text-white text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce-subtle border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#009B5B] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] m-4 mr-0 p-6 justify-between flex-shrink-0 min-h-[calc(100vh-2rem)]">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-2.5 px-2 mb-8">
            <img
              src="/assets/Icons/logo.png"
              alt="UntungJelas Logo"
              className="h-7 w-auto object-contain flex-shrink-0"
            />
            <span className="text-xl font-semibold tracking-tight text-gray-900 leading-none">
              Untung<span className="text-[#259A66]">Jelas</span>
            </span>
          </div>

          {/* Nav: Menu Utama */}
          <div className="mb-7">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2.5">
              Menu Utama
            </p>
            <nav className="space-y-1">
              {menuUtama.map((item) => {
                const Icon = item.icon
                const isActive = activeMenu === item.name
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveMenu(item.name)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all cursor-pointer relative ${
                      isActive
                        ? 'text-gray-900 font-bold bg-emerald-50/50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#009B5B] rounded-r-full" />
                    )}
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#009B5B] stroke-[2.5]' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Nav: Umum */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2.5">
              Umum
            </p>
            <nav className="space-y-1">
              {menuUmum.map((item) => {
                const Icon = item.icon
                const isActive = activeMenu === item.name
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveMenu(item.name)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'text-gray-900 font-bold bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>

            {/* Keluar Button Card (Exact match with Figma screenshot) */}
            <div className="mt-8">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-rose-50/40 border border-gray-200/90 rounded-[18px] text-xs sm:text-[13px] font-medium text-[#FF4D4F] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] active:scale-[0.98] cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#FF4D4F] stroke-[2]" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <img src="/assets/Icons/logo.png" alt="Logo" className="h-7 w-auto" />
                  <span className="text-xl font-semibold text-gray-900">
                    Untung<span className="text-[#259A66]">Jelas</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Menu Utama
                  </p>
                  <div className="space-y-1">
                    {menuUtama.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setActiveMenu(item.name)
                          setMobileSidebarOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          activeMenu === item.name
                            ? 'text-[#009B5B] bg-emerald-50'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Umum
                  </p>
                  <div className="space-y-1">
                    {menuUmum.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setActiveMenu(item.name)
                          setMobileSidebarOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Keluar Button */}
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-rose-50/50 border border-gray-200/90 rounded-[18px] text-xs font-medium text-[#FF4D4F] transition-all"
                    >
                      <LogOut className="w-4 h-4 text-[#FF4D4F] stroke-[2]" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col p-3 sm:p-5 lg:p-6 min-w-0 overflow-y-auto">
        
        {/* Top Header Card */}
        <header className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] px-4 sm:px-6 py-3 flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari transaksi, menu..."
                className="w-full bg-[#F8F9FA] rounded-full pl-9 pr-4 py-2 text-xs sm:text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#009B5B]/30 border-none"
              />
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-3 sm:gap-4 ml-4">
            {/* Bell Icon */}
            <button
              type="button"
              onClick={() => showToast('Tidak ada notifikasi baru hari ini.')}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-2 right-2 border-2 border-white" />
            </button>

            {/* Profile Avatar & Store Name */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full overflow-hidden bg-emerald-100 border-2 border-emerald-500/20 flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                  alt="Nabila"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs sm:text-[13px] font-semibold text-gray-800 hidden sm:inline whitespace-nowrap">
                Kedai Kopi Nabila
              </span>
            </div>
          </div>
        </header>

        {/* Greeting & Date / Quick Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight">
              Halo, Nabila!
            </h1>
            <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5">
              Berikut ringkasan performa finansial usahamu hari ini.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Date Pill */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200/80 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>Hari ini, 1 Nov 2026</span>
            </div>

            {/* Transaksi Baru Button */}
            <button
              type="button"
              onClick={() => setShowTransactionModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all hover:shadow active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Transaksi Baru</span>
            </button>
          </div>
        </div>

        {/* ================= 4 STAT CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5 sm:mb-6">
          
          {/* Card 1: Untung Bersih (Solid Green) */}
          <div className="bg-[#009B5B] text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-100">
                Untung Bersih Hari Ini
              </span>
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl sm:text-[26px] font-black tracking-tight">
                Rp250.000
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-100 font-medium">
              <span className="inline-block">▲</span>
              <span>12% dari kemarin</span>
            </div>
          </div>

          {/* Card 2: Total Omset Kotor */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Total Omset Kotor
              </span>
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                <Store className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight">
                Rp650.000
              </h3>
            </div>
            <div className="text-[11px] text-[#009B5B] font-semibold">
              +8% rata-rata harian
            </div>
          </div>

          {/* Card 3: Total Transaksi */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Total Transaksi
              </span>
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight">
                24 Struk
              </h3>
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              Rata-rata Rp27.800/struk
            </div>
          </div>

          {/* Card 4: Kesehatan Usaha */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-gray-500 block mb-1">
                Kesehatan Usaha
              </span>
              <div className="text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight my-1">
                82<span className="text-xs font-medium text-gray-400">/100</span>
              </div>
              <span className="inline-block bg-[#009B5B] text-white text-[10px] font-bold px-3 py-0.5 rounded-full mt-1">
                Sehat
              </span>
            </div>

            {/* Semi-Circle Speedometer Gauge */}
            <div className="relative w-24 h-14 flex items-end justify-center">
              <svg className="w-24 h-14" viewBox="0 0 100 55">
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 50 A 40 40 0 0 1 76 18"
                  fill="none"
                  stroke="#009B5B"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Pointer Needle */}
                <line
                  x1="50"
                  y1="50"
                  x2="72"
                  y2="24"
                  stroke="#1F2937"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="50" r="4" fill="#1F2937" />
              </svg>
            </div>
          </div>

        </div>

        {/* ================= 2 COLUMN MAIN GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          
          {/* ================= LEFT 8 COLS: CHART & TABLE ================= */}
          <div className="xl:col-span-8 space-y-5">
            
            {/* Chart: Analisis Omzet & Laba Bersih */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              {/* Chart Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900">
                    Analisis Omzet & Laba Bersih (7 Hari Terakhir)
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    Perkembangan arus omzet dan laba bersih usaha selama satu minggu terakhir.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChartFilter((prev) => ({ ...prev, omzet: !prev.omzet }))}
                    className={`text-xs px-3.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      chartFilter.omzet
                        ? 'bg-[#1E88E5] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    Omzet
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartFilter((prev) => ({ ...prev, laba: !prev.laba }))}
                    className={`text-xs px-3.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      chartFilter.laba
                        ? 'bg-[#009B5B] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    Laba Bersih
                  </button>
                </div>
              </div>

              {/* Chart Container */}
              <div className="relative w-full h-64 sm:h-72">
                
                {/* SVG Visual Chart */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240" preserveAspectRatio="none">
                  <defs>
                    {/* Blue Omzet Gradient */}
                    <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E88E5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1E88E5" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Green Laba Gradient */}
                    <linearGradient id="labaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#009B5B" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#009B5B" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  {[0, 50, 100, 150, 200].map((y, idx) => (
                    <line
                      key={idx}
                      x1="60"
                      y1={y}
                      x2="680"
                      y2={y}
                      stroke="#F3F4F6"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Omzet Area & Line */}
                  {chartFilter.omzet && (
                    <>
                      <polygon
                        points="60,110 150,135 250,90 350,120 450,95 550,110 650,80 650,200 60,200"
                        fill="url(#omzetGradient)"
                      />
                      <polyline
                        points="60,110 150,135 250,90 350,120 450,95 550,110 650,80"
                        fill="none"
                        stroke="#1E88E5"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Dots */}
                      {[
                        [60, 110],
                        [150, 135],
                        [250, 90],
                        [350, 120],
                        [450, 95],
                        [550, 110],
                        [650, 80],
                      ].map(([cx, cy], i) => (
                        <circle
                          key={i}
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="#FFFFFF"
                          stroke="#1E88E5"
                          strokeWidth="2.5"
                        />
                      ))}
                    </>
                  )}

                  {/* Laba Bersih Area & Line */}
                  {chartFilter.laba && (
                    <>
                      <polygon
                        points="60,150 150,165 250,135 350,155 450,140 550,155 650,135 650,200 60,200"
                        fill="url(#labaGradient)"
                      />
                      <polyline
                        points="60,150 150,165 250,135 350,155 450,140 550,155 650,135"
                        fill="none"
                        stroke="#009B5B"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Dots */}
                      {[
                        [60, 150],
                        [150, 165],
                        [250, 135],
                        [350, 155],
                        [450, 140],
                        [550, 155],
                        [650, 135],
                      ].map(([cx, cy], i) => (
                        <circle
                          key={i}
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="#FFFFFF"
                          stroke="#009B5B"
                          strokeWidth="2.5"
                        />
                      ))}
                    </>
                  )}
                </svg>

                {/* Y-Axis Labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-gray-400 font-medium">
                  <span>Rp800.000</span>
                  <span>Rp600.000</span>
                  <span>Rp400.000</span>
                  <span>Rp200.000</span>
                  <span>Rp0</span>
                </div>

                {/* X-Axis Labels */}
                <div className="absolute left-14 right-2 bottom-0 flex justify-between text-[11px] text-gray-400 font-medium pt-2 border-t border-gray-100">
                  <span>25 Okt</span>
                  <span>26 Okt</span>
                  <span>27 Okt</span>
                  <span>28 Okt</span>
                  <span>29 Okt</span>
                  <span>30 Okt</span>
                  <span className="font-bold text-gray-800">01 Nov</span>
                </div>

                {/* Floating Tooltip Callout on 01 Nov */}
                <div className="absolute right-2 top-10 bg-white/95 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-2.5 shadow-lg text-left pointer-events-none animate-fade-in-up">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Hari ini
                  </p>
                  <div className="space-y-1">
                    <span className="inline-block bg-blue-50 text-[#1E88E5] text-[11px] font-bold px-2 py-0.5 rounded">
                      Omset: Rp650.000
                    </span>
                    <br />
                    <span className="inline-block bg-emerald-50 text-[#009B5B] text-[11px] font-bold px-2 py-0.5 rounded">
                      Untung: Rp250.000
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-700 mt-1.5">
                    Margin Real: 43.8%
                  </p>
                </div>

              </div>
            </div>

            {/* Table: Evaluasi Keuntungan Produk */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="mb-5">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Evaluasi Keuntungan Produk (Rugi & Tipis)
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Pantau produk yang keuntungannya menipis atau merugi akibat kenaikan harga bahan baku.
                </p>
              </div>

              {/* Table Wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[560px]">
                  <thead>
                    <tr className="border-b border-gray-100 pb-3">
                      <th className="py-2.5 font-semibold text-xs text-blue-700">
                        <span className="bg-blue-50/80 px-3 py-1 rounded-lg">Nama Produk</span>
                      </th>
                      <th className="py-2.5 font-semibold text-xs text-blue-700">
                        <span className="bg-blue-50/80 px-3 py-1 rounded-lg">HPP</span>
                      </th>
                      <th className="py-2.5 font-semibold text-xs text-blue-700">
                        <span className="bg-blue-50/80 px-3 py-1 rounded-lg">Harga Jual</span>
                      </th>
                      <th className="py-2.5 font-semibold text-xs text-blue-700">
                        <span className="bg-blue-50/80 px-3 py-1 rounded-lg">Margin Real</span>
                      </th>
                      <th className="py-2.5 font-semibold text-xs text-blue-700">
                        <span className="bg-blue-50/80 px-3 py-1 rounded-lg">Status</span>
                      </th>
                      <th className="py-2.5 font-semibold text-xs text-blue-700 text-center">
                        <span className="bg-blue-50/80 px-3 py-1 rounded-lg">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((item) => {
                      const margin = item.price - item.hpp
                      const percent = Math.round((margin / item.price) * 100)
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                          {/* Nama Produk */}
                          <td className="py-3.5 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                                {item.icon === 'croissant' ? (
                                  <Croissant className="w-5 h-5 stroke-[1.8]" />
                                ) : (
                                  <Coffee className="w-5 h-5 stroke-[1.8]" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs sm:text-[13px] font-bold text-gray-900 leading-snug">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {item.category}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* HPP */}
                          <td className="py-3.5 text-xs font-semibold text-gray-800">
                            Rp{item.hpp.toLocaleString('id-ID')}
                          </td>

                          {/* Harga Jual */}
                          <td className="py-3.5 text-xs font-medium text-gray-700">
                            Rp{item.price.toLocaleString('id-ID')}
                          </td>

                          {/* Margin Real */}
                          <td className="py-3.5 text-xs font-bold">
                            {margin < 0 ? (
                              <span className="text-rose-500">
                                -Rp{Math.abs(margin).toLocaleString('id-ID')} ({percent}%)
                              </span>
                            ) : (
                              <span className={item.status === 'Tipis' ? 'text-amber-600' : 'text-[#009B5B]'}>
                                +Rp{margin.toLocaleString('id-ID')} ({percent}%)
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5">
                            {item.status === 'Rugi' && (
                              <span className="inline-block bg-rose-50 text-rose-600 border border-rose-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                Rugi
                              </span>
                            )}
                            {item.status === 'Tipis' && (
                              <span className="inline-block bg-amber-50 text-amber-600 border border-amber-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                Tipis
                              </span>
                            )}
                            {item.status === 'Sehat' && (
                              <span className="inline-block bg-emerald-50 text-[#009B5B] border border-emerald-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                Sehat
                              </span>
                            )}
                          </td>

                          {/* Aksi */}
                          <td className="py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => setShowEditModal(item)}
                              className="text-[11px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 shadow-sm transition-all cursor-pointer"
                            >
                              Edit HPP / Harga
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ================= RIGHT 4 COLS: AI INSIGHTS & CASH DRAWER ================= */}
          <div className="xl:col-span-4 space-y-5">
            
            {/* Card: Insight Bisnis AI */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
              
              {/* AI Header Banner */}
              <div className="bg-gradient-to-r from-[#1E88E5] to-[#009B5B] px-4 sm:px-5 py-3 text-white flex items-center gap-2.5 shadow-sm">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                    Insight Bisnis AI
                  </h3>
                  <p className="text-[10px] text-white/80">
                    AI Insights Real-Time
                  </p>
                </div>
              </div>

              {/* AI Body Content */}
              <div className="p-4 sm:p-5 space-y-3.5">
                
                {/* AI Item 1: Rekomendasi Margin Otomatis */}
                <div className="bg-[#FAFCFB] border border-emerald-100/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#009B5B]" />
                      <span>Rekomendasi Margin Otomatis</span>
                    </div>
                    <span className="bg-rose-50 text-rose-500 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Perhatian
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    Harga Mentega naik 15%, bikin{' '}
                    <span className="font-bold text-rose-600">Croissant Cokelat rugi Rp500</span> per
                    biji. Yuk, naikkan harga jual jadi{' '}
                    <span className="font-bold text-[#009B5B]">Rp13.000</span> biar tetap untung!
                  </p>
                  <button
                    type="button"
                    onClick={handleAdjustCroissantPrice}
                    className="w-full mt-3 py-2 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    Sesuaikan Harga Croissant
                  </button>
                </div>

                {/* AI Item 2: Peringatan Stok Cepat Habis */}
                <div className="bg-[#F8FAFD] border border-blue-100/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-blue-900 text-[11px] font-bold">
                      <TrendingUp className="w-3.5 h-3.5 text-[#1E88E5]" />
                      <span>Peringatan Stok Cepat Habis</span>
                    </div>
                    <span className="bg-amber-50 text-amber-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Perhatian
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    Kopi Susu Gula Aren laku keras hari ini! Stok Gula Aren kamu tinggal cukup buat{' '}
                    <span className="font-bold text-amber-600">5 cup lagi</span>. Mau belanja stoknya
                    lagi sekarang?
                  </p>
                  <button
                    type="button"
                    onClick={() => showToast('Membuka daftar pesanan supplier Gula Aren...')}
                    className="w-full mt-3 py-2 bg-[#1E88E5] hover:bg-[#1976D2] text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    Pesan Gula Aren
                  </button>
                </div>

              </div>

              {/* AI Bottom Input Box */}
              <div className="p-3 sm:p-4 border-t border-gray-100 bg-[#FAFAFA]">
                <form onSubmit={handleAskAi} className="relative flex items-center">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Tanya analisamu ke AI..."
                    className="w-full bg-white border border-gray-200 rounded-xl pl-3.5 pr-10 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B]/30"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 w-7 h-7 bg-[#009B5B] hover:bg-[#00874e] text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </form>
              </div>

            </div>

            {/* Card: Status Laci Kasir */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E88E5]">
                  <Store className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-[13px] font-bold text-gray-900">
                    Status Laci Kasir
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                    Modal Awal: <span className="font-semibold text-gray-600">Rp200.000</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm sm:text-base font-extrabold text-[#009B5B]">
                  Rp850.000
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Kas di Tangan
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ================= MODAL: EDIT HPP / HARGA ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Edit HPP & Harga Jual
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {showEditModal.name}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.target
                handleSavePriceEdit(
                  showEditModal.id,
                  form.hpp.value,
                  form.price.value
                )
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  HPP (Modal per Porsi/Unit)
                </label>
                <input
                  name="hpp"
                  type="number"
                  defaultValue={showEditModal.hpp}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#009B5B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Harga Jual ke Pelanggan
                </label>
                <input
                  name="price"
                  type="number"
                  defaultValue={showEditModal.price}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#009B5B]"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#009B5B] hover:bg-[#00874e] rounded-xl shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRANSAKSI BARU ================= */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Catat Transaksi Baru
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Pilih menu yang terjual untuk langsung memperbarui kasir & keuntungan.
            </p>

            <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setShowTransactionModal(false)
                    showToast(`Transaksi 1x ${p.name} (Rp${p.price.toLocaleString('id-ID')}) tercatat!`)
                  }}
                  className="p-3 border border-gray-100 rounded-xl hover:border-[#009B5B] hover:bg-emerald-50/30 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-800">{p.name}</p>
                    <p className="text-[10px] text-gray-400">Rp{p.price.toLocaleString('id-ID')}</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#009B5B]">+ Tambah</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowTransactionModal(false)}
              className="w-full py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

