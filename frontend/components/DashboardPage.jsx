import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
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
  Send,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Wallet,
  Receipt,
  Eye,
  Menu,
  X,
  CheckCircle2,
  Coffee,
  Croissant,
  ChevronDown,
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  ArrowRight,
  ArrowUp,
  Activity,
  BarChart2,
  MoreVertical,
  Utensils,
  Trash2,
  RotateCcw,
  Banknote,
  QrCode,
  CreditCard,
  Package,
  Star,
  Printer,
  Share2,
  Loader2,
  Tag
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import RollNumberTicker from './RollNumberTicker'
import KatalogHppPage from './KatalogHppPage'
import LaporanKeuanganPage from './LaporanKeuanganPage'
import SettingsPage from './SettingsPage'
import HelpPage from './HelpPage'

// Database records dinamis diambil dari GET /api/dashboard/stats
const DAILY_RECORDS = {}

// Generate organic café rush patterns for any date
const getHourlyPattern = (dateStr, totalOmzet, totalLaba) => {
  const d = new Date(dateStr)
  const dayOfWeek = d.getDay() // 0 = Sun, 6 = Sat
  const dayNum = parseInt(dateStr.slice(-2), 10) || 1

  // Natural coffee shop / cafe hourly volume weights:
  // 08:00 (Breakfast/morning commute), 10:00 (Brunch/work), 12:00 (Lunch rush peak),
  // 14:00 (Post-lunch lull), 16:00 (Tea/coffee break), 18:00 (Dinner hangout rush), 20:00 (Closing orders)
  let baseWeights
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend: slow morning, big lunch rush, consistent afternoon, high dinner hangout
    baseWeights = [0.08, 0.16, 0.23, 0.11, 0.14, 0.21, 0.07]
  } else if (dayOfWeek === 5) {
    // Friday: quiet morning, strong lunch, big evening rush
    baseWeights = [0.10, 0.13, 0.22, 0.12, 0.15, 0.21, 0.07]
  } else {
    // Weekday: morning rush, sharp lunch peak, afternoon coffee, moderate evening
    baseWeights = [0.14, 0.13, 0.25, 0.11, 0.12, 0.18, 0.07]
  }

  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
  const trend = hours.map((hour, idx) => {
    // Natural deterministic variation (+/- 2%) so every single day is visually unique
    const variation = Math.sin((dayNum * 3 + idx * 7) * 0.8) * 0.02
    const w = Math.max(0.04, baseWeights[idx] + variation)
    const omzetVal = Math.round((totalOmzet * w) / 5000) * 5000
    const marginRatio = totalOmzet > 0 ? totalLaba / totalOmzet : 0.38
    const labaVal = Math.round((omzetVal * marginRatio) / 1000) * 1000
    return { day: hour, omzet: omzetVal, laba: labaVal }
  })

  return trend
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

const formatDayMonth = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  const m = parseInt(parts[1], 10)
  const d = parseInt(parts[2], 10)
  return `${d} ${MONTH_SHORT_ID[m - 1]}`
}

const getTodayDateStr = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getYesterdayDateStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getLast7DaysStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getTodayLabel = () => {
  const now = new Date()
  return `Hari ini, ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export default function DashboardPage({ onLogout, initialMenu = 'Dashboard' }) {
  const { user, updateUser } = useAuth()
  const [activeMenu, setActiveMenu] = useState(initialMenu)

  // Sync if initialMenu changes from parent
  useEffect(() => {
    if (initialMenu) {
      setActiveMenu(initialMenu)
    }
  }, [initialMenu])

  // Sync menu if URL hash changes
  useEffect(() => {
    const syncMenuFromHash = () => {
      const h = window.location.hash
      if (h === '#produk' || h === '#katalog') {
        setActiveMenu('Katalog & HPP')
      } else if (h === '#kasir') {
        setActiveMenu('Kasir')
      } else if (h === '#laporan') {
        setActiveMenu('Laporan Keuangan')
      } else if (h === '#ai') {
        setActiveMenu('Asisten AI')
      } else if (h === '#dashboard') {
        setActiveMenu('Dashboard')
      }
    }
    syncMenuFromHash()
    window.addEventListener('hashchange', syncMenuFromHash)
    return () => window.removeEventListener('hashchange', syncMenuFromHash)
  }, [])

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [chartSeries, setChartSeries] = useState({ omzet: true, laba: true, costs: true })
  const [comparePrevious, setComparePrevious] = useState(false)
  const [chartMode, setChartMode] = useState('line') // 'line' or 'bar'
  const [activeChartIndex, setActiveChartIndex] = useState(null)
  
  // ================= TOP BAR STATES =================
  // 1. Date Filter & Interactive Calendar States
  const [selectedDateFilter, setSelectedDateFilter] = useState(() => getTodayLabel())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedStartDate, setSelectedStartDate] = useState(() => getTodayDateStr())
  const [selectedEndDate, setSelectedEndDate] = useState(() => getTodayDateStr())
  const [tempStart, setTempStart] = useState(() => getTodayDateStr())
  const [tempEnd, setTempEnd] = useState(() => getTodayDateStr())
  const [chartTitle, setChartTitle] = useState('Performa Finansial & Arus Kas Hari Ini')
  const [chartSubtitle, setChartSubtitle] = useState('Pantau tren omzet, modal bahan baku (HPP), dan laba bersih usaha secara real-time.')
  
  // 2. Search Autocomplete
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  // 3. Notification Popover
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)
  
  // 4. User Profile Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // ================= AI & MODAL STATES =================
  const [aiQuestion, setAiQuestion] = useState('')
  const [isAiPanelMinimized, setIsAiPanelMinimized] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showEditModal, setShowEditModal] = useState(null)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Halo! Saya UntungJelas AI. Saya siap membantu menganalisis laba, margin resep, evaluasi harga jual, dan strategi pengembangan usaha Anda. Apa yang ingin Anda diskusikan?',
      time: 'Baru saja'
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [shiftInfo, setShiftInfo] = useState({
    active: 'Pagi',
    time: '08:00 - 16:00',
    kasir: user?.name ? `${user.name} (Owner)` : 'Pemilik Usaha'
  })

  // Refs for click outside detection
  const datePickerRef = useRef(null)
  const searchRef = useRef(null)
  const notificationRef = useRef(null)
  const profileRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setIsDatePickerOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ================= DYNAMIC KPI STATS =================
  const [kpiStats, setKpiStats] = useState(() => {
    if (user?.id) {
      try {
        const cached = sessionStorage.getItem(`uj_kpi_${user.id}`)
        if (cached) return JSON.parse(cached)
      } catch (e) {}
    }
    return {
      untung: 0,
      untungGrowth: 'Belum ada transaksi hari ini',
      omzet: 0,
      omzetGrowth: 'Buka kasir untuk mulai transaksi',
      transaksi: 0,
      transaksiSub: 'Modal Bahan: Rp0',
      kesehatan: 0,
      kesehatanLabel: 'Belum Ada Transaksi'
    }
  })

  // ================= REAL-TIME TREND CHART STATE =================
  const [trendData, setTrendData] = useState([])
  const [prevTrendData, setPrevTrendData] = useState([])

  // Universal Real-time update function: immediately moves Chart lines up or down
  const updateRealtimeData = (deltaOmzet, deltaLaba, label = '') => {
    setTrendData((prev) => {
      const prevArr = Array.isArray(prev) ? prev : []
      if (prevArr.length === 0) {
        return [{
          day: 'Hari Ini',
          date: getTodayDateStr(),
          omzet: Math.max(0, deltaOmzet),
          laba: Math.max(0, deltaLaba),
          costs: Math.max(0, deltaOmzet - deltaLaba),
        }]
      }
      const updated = [...prevArr]
      const lastIndex = updated.length - 1
      const current = updated[lastIndex] || { omzet: 0, laba: 0 }
      const newOmzet = Math.max(0, (Number(current.omzet) || 0) + deltaOmzet)
      const newLaba = Math.max(0, (Number(current.laba) || 0) + deltaLaba)
      const newCosts = Math.max(0, newOmzet - newLaba)
      updated[lastIndex] = { ...current, omzet: newOmzet, laba: newLaba, costs: newCosts }
      return updated
    })

    setKpiStats((prev) => {
      const currentOmzet = Number(prev.omzet) || 0
      const currentUntung = Number(prev.untung) || 0
      const currentCount = parseInt(prev.transaksi, 10) || 0
      const newOmzet = Math.max(0, currentOmzet + deltaOmzet)
      const newUntung = Math.max(0, currentUntung + deltaLaba)
      const newCount = deltaOmzet > 0 ? currentCount + 1 : currentCount
      const margin = newOmzet > 0 ? Math.round((newUntung / newOmzet) * 100) : 0
      return {
        ...prev,
        omzet: newOmzet,
        untung: newUntung,
        transaksi: newCount,
        omzetGrowth: newCount > 0 ? `${newCount} transaksi tercatat hari ini` : 'Buka kasir untuk mulai transaksi',
        untungGrowth: newOmzet > 0 ? `Margin rata-rata ${margin}%` : 'Belum ada transaksi hari ini',
        kesehatan: Math.min(100, Math.max(0, Math.round(margin * 1.5 + 20))),
        kesehatanLabel: margin >= 20 ? 'Sangat Sehat' : margin > 0 ? 'Cukup Sehat' : 'Perlu Evaluasi'
      }
    })

    if (deltaOmzet > 0) {
      showToast(`📈 [Penjualan Masuk] +Rp${deltaOmzet.toLocaleString('id-ID')} (${label || 'Pesanan baru'})`)
    } else if (deltaOmzet < 0) {
      showToast(`📉 [Retur/Biaya] -Rp${Math.abs(deltaOmzet).toLocaleString('id-ID')} (${label || 'Pengurangan'})`)
    } else if (deltaLaba > 0) {
      showToast(`📈 [Laba Bertambah] +Rp${deltaLaba.toLocaleString('id-ID')} (${label || 'Margin naik'})`)
    }
  }

  // Date range options with associated trend datasets & real previous periods
  const dateOptions = [
    {
      label: 'Hari ini, 1 Nov 2026',
      sub: 'Tren 7 hari terkini (25 Okt - 1 Nov)',
      trend: [
        { day: '25 Okt', omzet: 450000, laba: 175000 },
        { day: '26 Okt', omzet: 410000, laba: 155000 },
        { day: '27 Okt', omzet: 520000, laba: 220000 },
        { day: '28 Okt', omzet: 440000, laba: 180000 },
        { day: '29 Okt', omzet: 490000, laba: 200000 },
        { day: '30 Okt', omzet: 460000, laba: 190000 },
        { day: '01 Nov', omzet: 650000, laba: 250000 }
      ],
      prevTrend: [
        { day: '18 Okt', omzet: 630000, laba: 260000 },
        { day: '19 Okt', omzet: 440000, laba: 170000 },
        { day: '20 Okt', omzet: 460000, laba: 180000 },
        { day: '21 Okt', omzet: 480000, laba: 190000 },
        { day: '22 Okt', omzet: 510000, laba: 205000 },
        { day: '23 Okt', omzet: 530000, laba: 215000 },
        { day: '24 Okt', omzet: 570000, laba: 230000 }
      ],
      stats: {
        untung: 250000,
        untungGrowth: '12% dari kemarin',
        omzet: 650000,
        omzetGrowth: '+8% rata-rata harian',
        transaksi: '24 Struk',
        transaksiSub: 'Rata-rata Rp27.800/struk',
        kesehatan: 82,
        kesehatanLabel: 'Sehat'
      }
    },
    {
      label: 'Kemarin (31 Okt 2026)',
      sub: 'Tren 7 hari hingga 31 Okt',
      trend: [
        { day: '24 Okt', omzet: 570000, laba: 230000 },
        { day: '25 Okt', omzet: 450000, laba: 175000 },
        { day: '26 Okt', omzet: 410000, laba: 155000 },
        { day: '27 Okt', omzet: 520000, laba: 220000 },
        { day: '28 Okt', omzet: 440000, laba: 180000 },
        { day: '29 Okt', omzet: 490000, laba: 200000 },
        { day: '31 Okt', omzet: 580000, laba: 220000 }
      ],
      prevTrend: [
        { day: '17 Okt', omzet: 610000, laba: 250000 },
        { day: '18 Okt', omzet: 630000, laba: 260000 },
        { day: '19 Okt', omzet: 440000, laba: 170000 },
        { day: '20 Okt', omzet: 460000, laba: 180000 },
        { day: '21 Okt', omzet: 480000, laba: 190000 },
        { day: '22 Okt', omzet: 510000, laba: 205000 },
        { day: '23 Okt', omzet: 530000, laba: 215000 }
      ],
      stats: {
        untung: 220000,
        untungGrowth: '-5% dari target',
        omzet: 580000,
        omzetGrowth: '+4% rata-rata harian',
        transaksi: '21 Struk',
        transaksiSub: 'Rata-rata Rp27.600/struk',
        kesehatan: 80,
        kesehatanLabel: 'Sehat'
      }
    },
    {
      label: '7 Hari Terakhir (26 Okt - 1 Nov)',
      sub: 'Tren 1 minggu ke belakang',
      trend: [
        { day: '26 Okt', omzet: 410000, laba: 155000 },
        { day: '27 Okt', omzet: 520000, laba: 220000 },
        { day: '28 Okt', omzet: 440000, laba: 180000 },
        { day: '29 Okt', omzet: 490000, laba: 200000 },
        { day: '30 Okt', omzet: 460000, laba: 190000 },
        { day: '31 Okt', omzet: 580000, laba: 220000 },
        { day: '01 Nov', omzet: 650000, laba: 250000 }
      ],
      prevTrend: [
        { day: '19 Okt', omzet: 440000, laba: 170000 },
        { day: '20 Okt', omzet: 460000, laba: 180000 },
        { day: '21 Okt', omzet: 480000, laba: 190000 },
        { day: '22 Okt', omzet: 510000, laba: 205000 },
        { day: '23 Okt', omzet: 530000, laba: 215000 },
        { day: '24 Okt', omzet: 570000, laba: 230000 },
        { day: '25 Okt', omzet: 450000, laba: 175000 }
      ],
      stats: {
        untung: 1515000,
        untungGrowth: '+14% minggu lalu',
        omzet: 3550000,
        omzetGrowth: '+10% rata-rata mingguan',
        transaksi: '128 Struk',
        transaksiSub: 'Rata-rata Rp27.700/struk',
        kesehatan: 85,
        kesehatanLabel: 'Sangat Sehat'
      }
    },
    {
      label: 'Bulan Ini (November 2026)',
      sub: 'Akumulasi bulan berjalan',
      trend: [
        { day: '01 Nov', omzet: 650000, laba: 250000 },
        { day: 'Minggu 1', omzet: 650000, laba: 250000 },
        { day: 'Minggu 2', omzet: 0, laba: 0 },
        { day: 'Minggu 3', omzet: 0, laba: 0 },
        { day: 'Minggu 4', omzet: 0, laba: 0 },
        { day: 'Target', omzet: 750000, laba: 320000 },
        { day: 'Estimasi', omzet: 780000, laba: 340000 }
      ],
      prevTrend: [
        { day: '01 Okt', omzet: 420000, laba: 170000 },
        { day: 'Minggu 1', omzet: 480000, laba: 195000 },
        { day: 'Minggu 2', omzet: 520000, laba: 210000 },
        { day: 'Minggu 3', omzet: 540000, laba: 220000 },
        { day: 'Minggu 4', omzet: 570000, laba: 230000 },
        { day: 'Target', omzet: 700000, laba: 300000 },
        { day: 'Estimasi', omzet: 720000, laba: 310000 }
      ],
      stats: {
        untung: 250000,
        untungGrowth: 'Awal bulan',
        omzet: 650000,
        omzetGrowth: 'Target 18jt',
        transaksi: '24 Struk',
        transaksiSub: 'Rata-rata Rp27.800/struk',
        kesehatan: 82,
        kesehatanLabel: 'Sehat'
      }
    },
    {
      label: 'Bulan Lalu (Oktober 2026)',
      sub: 'Total performa 1 bulan penuh',
      trend: [
        { day: '01 Okt', omzet: 420000, laba: 170000 },
        { day: '06 Okt', omzet: 410000, laba: 160000 },
        { day: '11 Okt', omzet: 590000, laba: 245000 },
        { day: '16 Okt', omzet: 540000, laba: 220000 },
        { day: '21 Okt', omzet: 480000, laba: 190000 },
        { day: '26 Okt', omzet: 410000, laba: 155000 },
        { day: '31 Okt', omzet: 580000, laba: 220000 }
      ],
      prevTrend: [
        { day: '15 Sep', omzet: 410000, laba: 160000 },
        { day: '18 Sep', omzet: 490000, laba: 195000 },
        { day: '21 Sep', omzet: 390000, laba: 150000 },
        { day: '24 Sep', omzet: 470000, laba: 190000 },
        { day: '27 Sep', omzet: 600000, laba: 250000 },
        { day: '29 Sep', omzet: 430000, laba: 170000 },
        { day: '30 Sep', omzet: 460000, laba: 185000 }
      ],
      stats: {
        untung: 6850000,
        untungGrowth: '+19% dari September',
        omzet: 17400000,
        omzetGrowth: 'Target tercapai 105%',
        transaksi: '618 Struk',
        transaksiSub: 'Rata-rata Rp28.100/struk',
        kesehatan: 88,
        kesehatanLabel: 'Sangat Sehat'
      }
    }
  ]

  // Notifications dataset
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Selamat Datang di UntungJelas!',
      message: 'Mulai dengan menambahkan menu dan resep bahan baku Anda di menu Katalog & HPP.',
      time: 'Baru saja',
      read: false
    }
  ])

  // ================= KASIR & KATALOG HPP STATE =================
  const [posCatalog, setPosCatalog] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [posCart, setPosCart] = useState([])

  const fetchPosProducts = async () => {
    try {
      setLoadingProducts(true)
      const res = await api.get('/products')
      const rawProducts = res.data?.data || []
      if (Array.isArray(rawProducts) && rawProducts.length > 0) {
        const productsData = rawProducts.map((p) => {
          const price = Number(p.selling_price) || 0
          const hpp = Number(p.modal_per_unit) || 0
          const profit = price - hpp
          const marginPct = price > 0 ? Number(((profit / price) * 100).toFixed(1)) : 0

          const lowerName = (p.name || '').toLowerCase()
          let img = p.image || ''
          if (!img) {
            if (lowerName.includes('croissant') && lowerName.includes('almond')) img = '/assets/kasir/almond-croissant.png'
            else if (lowerName.includes('croissant')) img = '/assets/kasir/croissant.png'
            else if (lowerName.includes('latte') && lowerName.includes('gayo')) img = '/assets/kasir/cafe-latte.png'
            else if (lowerName.includes('matcha')) img = '/assets/kasir/matcha-latte.png'
            else if (lowerName.includes('cold') || lowerName.includes('brew')) img = '/assets/kasir/cold-brew.png'
            else if (lowerName.includes('roti')) img = '/assets/kasir/roti-bakar.png'
            else if (lowerName.includes('spaghetti') || lowerName.includes('pasta')) img = '/assets/kasir/spaghetti.png'
            else img = '/assets/kasir/kopi-susu.png'
          }

          let category = p.category || 'Minuman'
          if (!p.category) {
            if (lowerName.includes('croissant') || lowerName.includes('bakery') || lowerName.includes('pastry') || lowerName.includes('almond')) category = 'Pastry & Bakery'
            else if (lowerName.includes('roti') || lowerName.includes('spaghetti') || lowerName.includes('makan') || lowerName.includes('nasi') || lowerName.includes('mie') || lowerName.includes('pasta')) category = 'Makanan'
          }

          let status = 'Sehat'
          if (profit < 0) status = 'Rugi'
          else if (marginPct < 30) status = 'Tipis'

          return {
            id: p.id,
            name: p.name,
            category: category,
            sku: `BEV${String(p.id).padStart(3, '0')}`,
            desc: p.ingredients && p.ingredients.length > 0
              ? p.ingredients.map((i) => i.name).join(', ')
              : 'Resep terstandarisasi',
            price: price,
            hpp: hpp,
            profit: profit,
            marginPct: marginPct,
            image: img,
            popular: false,
            status: status,
            ingredients: (p.ingredients || []).map((ing, idx) => ({
              id: ing.id || idx + 1,
              name: ing.name,
              detail: 'Takaran standar',
              amount: '1 porsi',
              cost: Number(ing.price) || 0,
            })),
          }
        })
        setPosCatalog(productsData)
      } else {
        setPosCatalog([])
      }
    } catch (err) {
      console.error('Gagal memuat produk kasir:', err)
      setPosCatalog([])
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchPosProducts()
  }, [user?.id])

  // Search Autocomplete Database (dinamis dari katalog produk user)
  const searchDatabase = (posCatalog || []).map((p) => ({
    type: 'Produk',
    title: p.name,
    desc: `${p.category || 'Menu'} • Rp${(p.price || 0).toLocaleString('id-ID')}`
  }))

  const filteredSearchResults = searchDatabase.filter((item) => {
    if (!searchQuery.trim()) return true
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Product evaluation list
  const [products, setProducts] = useState([])

  // Dashboard Stats States (GET /api/dashboard/stats)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(null)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [insightData, setInsightData] = useState({
    headline: 'Memuat Rekomendasi...',
    text: 'Sistem sedang menganalisis kesehatan margin usaha Anda...',
    source: 'fallback'
  })

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true)
      setStatsError(null)
      const res = await api.get('/dashboard/stats')
      const data = res.data?.data
      if (data) {
        setDashboardStats(data)

        const today = data.today || {}
        const omzetVal = Number(today.omzet) || 0
        const labaVal = Number(today.laba) || 0
        const modalVal = Number(today.modal) || 0
        const countVal = Number(today.transaksi_count) || 0
        const marginVal = Number(today.margin_rata_rata) || 0

        const newKpi = {
          untung: labaVal,
          untungGrowth: omzetVal > 0 ? `Margin rata-rata ${marginVal}%` : 'Belum ada transaksi hari ini',
          omzet: omzetVal,
          omzetGrowth: countVal > 0 ? `${countVal} transaksi tercatat hari ini` : 'Buka kasir untuk mulai transaksi',
          transaksi: countVal,
          transaksiSub: `Modal Bahan: Rp${modalVal.toLocaleString('id-ID')}`,
          kesehatan: Math.min(100, Math.max(0, Math.round(marginVal * 1.5 + 20))),
          kesehatanLabel: marginVal >= 20 ? 'Sangat Sehat' : marginVal > 0 ? 'Cukup Sehat' : 'Perlu Evaluasi'
        }
        setKpiStats(newKpi)
        if (user?.id) {
          try {
            sessionStorage.setItem(`uj_kpi_${user.id}`, JSON.stringify(newKpi))
          } catch (e) {}
        }

        const rawTrend = data.trend_14_days || data.trend
        if (rawTrend && Array.isArray(rawTrend)) {
          const formattedTrend = rawTrend.map((t) => {
            const d = new Date(t.date)
            const dayLabel = t.day || d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            return {
              day: dayLabel,
              date: t.date,
              omzet: Number(t.omzet) || 0,
              laba: Number(t.laba) || 0,
              modal: Number(t.modal) || 0,
            }
          })
          setTrendData(formattedTrend)

          // Populate DAILY_RECORDS cache so interactive calendar uses real backend data
          rawTrend.forEach((t) => {
            DAILY_RECORDS[t.date] = {
              omzet: Number(t.omzet) || 0,
              laba: Number(t.laba) || 0,
              transaksi: Number(t.transaksi_count) || 0,
            }
          })
        }

        const todayKey = getTodayDateStr()
        DAILY_RECORDS[todayKey] = {
          omzet: omzetVal,
          laba: labaVal,
          transaksi: countVal,
        }

        // Fetch recent transactions list for dashboard card
        fetchRecentTransactions()

        if (data.products && Array.isArray(data.products)) {
          const mappedProducts = data.products.map((p) => {
            const price = Number(p.selling_price) || 0
            const hpp = Number(p.modal_per_unit) || 0
            const profit = price - hpp
            return {
              id: p.id,
              name: p.name,
              category: p.category || (p.ingredients?.map(i => i.name).slice(0, 2).join(', ') || 'Menu Usaha'),
              hpp: hpp,
              price: price,
              profit: profit,
              marginPercent: Number(p.margin_percent) || 0,
              status: p.status === 'rugi' ? 'Rugi' : p.status === 'tipis' ? 'Tipis' : 'Sehat',
              icon: p.name.toLowerCase().includes('kopi') || p.name.toLowerCase().includes('latte') ? 'coffee' : 'croissant'
            }
          })
          setProducts(mappedProducts)
        }

        if (data.insight) {
          setInsightData(data.insight)
        }
      }
    } catch (err) {
      console.error('Gagal memuat statistik dashboard:', err)
      setStatsError(err.response?.data?.message || 'Gagal memuat statistik dashboard. Pastikan server backend aktif.')
    } finally {
      setStatsLoading(false)
    }
  }

  // Health Score States (GET /api/health-score)
  const [healthScoreData, setHealthScoreData] = useState({
    score: null,
    label: 'Memuat...',
    alasan: [],
    saran: [],
    narasi: '',
    source: 'fallback',
    breakdown: null,
    loading: true,
    error: null,
  })
  const [showHealthScoreDetails, setShowHealthScoreDetails] = useState(false)

  const fetchHealthScore = async () => {
    try {
      setHealthScoreData((prev) => ({ ...prev, loading: true, error: null }))
      const res = await api.get('/health-score')
      const d = res.data?.data
      if (d) {
        setHealthScoreData({
          score: typeof d.score === 'number' ? d.score : 0,
          label: d.label || 'Belum Ada Transaksi',
          alasan: d.alasan || d.reasons || [],
          saran: d.saran || d.recommendations || [],
          narasi: d.narasi || '',
          source: d.source || 'fallback',
          breakdown: d.breakdown || null,
          loading: false,
          error: null,
        })
      }
    } catch (err) {
      console.error('Gagal memuat skor kesehatan:', err)
      setHealthScoreData((prev) => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat skor kesehatan usaha. Pastikan server backend aktif.',
      }))
    }
  }

  const [recentTransactions, setRecentTransactions] = useState([])

  const fetchRecentTransactions = async () => {
    try {
      const res = await api.get('/transactions')
      let raw = res.data?.data || []
      if (!raw || raw.length === 0) {
        const resAll = await api.get('/transactions?date=all')
        raw = resAll.data?.data || []
      }
      setRecentTransactions(Array.isArray(raw) ? raw.slice(0, 5) : [])
    } catch (e) {
      console.warn('Gagal memuat transaksi terbaru:', e)
    }
  }

  useEffect(() => {
    if (activeMenu === 'Dashboard') {
      fetchDashboardStats()
      fetchHealthScore()
      fetchRecentTransactions()
    }
  }, [activeMenu, user?.id])



  const [posCategory, setPosCategory] = useState('Semua')

  const availablePosCategories = useMemo(() => {
    const list = [{ id: 'Semua', label: 'Semua', icon: LayoutGrid }]
    const known = new Set(['Semua'])

    ;(posCatalog || []).forEach((p) => {
      const cat = (p.category || '').trim()
      if (cat && !known.has(cat)) {
        known.add(cat)
        let CatIcon = Tag
        const lower = cat.toLowerCase()
        if (
          lower.includes('minum') ||
          lower.includes('kopi') ||
          lower.includes('tea') ||
          lower.includes('teh') ||
          lower.includes('drink') ||
          lower.includes('jus') ||
          lower.includes('latte')
        ) {
          CatIcon = Coffee
        } else if (
          lower.includes('pastry') ||
          lower.includes('bakery') ||
          lower.includes('croissant') ||
          lower.includes('roti') ||
          lower.includes('cake') ||
          lower.includes('kue')
        ) {
          CatIcon = Croissant
        } else if (
          lower.includes('makan') ||
          lower.includes('food') ||
          lower.includes('nasi') ||
          lower.includes('mie') ||
          lower.includes('pasta') ||
          lower.includes('ayam') ||
          lower.includes('lauk')
        ) {
          CatIcon = Utensils
        } else if (
          lower.includes('snack') ||
          lower.includes('camilan') ||
          lower.includes('cemilan') ||
          lower.includes('paket')
        ) {
          CatIcon = Package
        }
        list.push({ id: cat, label: cat, icon: CatIcon })
      }
    })
    return list
  }, [posCatalog])
  const [posSearch, setPosSearch] = useState('')
  const [posPaymentMethod, setPosPaymentMethod] = useState('Tunai')
  const [posShiftProfit, setPosShiftProfit] = useState(0)
  const [posReceiptModal, setPosReceiptModal] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const countDays = (s, e) => {
    if (!s) return 0
    if (!e || s === e) return 1
    const d1 = new Date(s)
    const d2 = new Date(e)
    return Math.round(Math.abs((d2 - d1) / (1000 * 60 * 60 * 24))) + 1
  }

  const applyDateSelection = (startDate, endDate) => {
    const start = startDate
    const end = endDate || startDate
    const isSingleDay = start === end

    setSelectedStartDate(start)
    setSelectedEndDate(end)

    if (isSingleDay) {
      const dData = DAILY_RECORDS[start] || { omzet: 0, laba: 0, transaksi: 0 }
      const isToday = start === getTodayDateStr()
      const label = isToday ? getTodayLabel() : `${formatDayMonth(start)} ${new Date(start).getFullYear()}`
      
      setSelectedDateFilter(label)
      setChartTitle(isToday ? 'Performa Finansial & Arus Kas Hari Ini' : `Performa Jam Sibuk & Arus Kas (${label})`)
      setChartSubtitle(`Pantau pola lonjakan transaksi dan laba bersih sepanjang jam buka toko pada ${label}.`)

      // Generate realistic dynamic hourly curve for selected day
      const currentHourly = getHourlyPattern(start, dData.omzet, dData.laba)
      setTrendData(currentHourly)

      // Calculate real comparison period: Previous Day
      const prevDateObj = new Date(start)
      prevDateObj.setDate(prevDateObj.getDate() - 1)
      const yPrev = prevDateObj.getFullYear()
      const mPrev = String(prevDateObj.getMonth() + 1).padStart(2, '0')
      const dPrev = String(prevDateObj.getDate()).padStart(2, '0')
      const prevDateStr = `${yPrev}-${mPrev}-${dPrev}`

      const prevData = DAILY_RECORDS[prevDateStr] || {
        omzet: Math.round(dData.omzet * 0.9),
        laba: Math.round(dData.laba * 0.9),
        transaksi: Math.round(dData.transaksi * 0.9)
      }
      const prevHourly = getHourlyPattern(prevDateStr, prevData.omzet, prevData.laba)
      setPrevTrendData(prevHourly)

      const margin = dData.omzet > 0 ? Math.round((dData.laba / dData.omzet) * 100) : 0

      setKpiStats({
        untung: dData.laba,
        untungGrowth: dData.omzet > 0 ? `Margin rata-rata ${margin}%` : 'Belum ada transaksi hari ini',
        omzet: dData.omzet,
        omzetGrowth: dData.transaksi > 0 ? `${dData.transaksi} transaksi tercatat hari ini` : 'Buka kasir untuk mulai transaksi',
        transaksi: dData.transaksi,
        transaksiSub: dData.transaksi > 0 ? `Rata-rata Rp${Math.round(dData.omzet / dData.transaksi).toLocaleString('id-ID')}/struk` : 'Modal Bahan: Rp0',
        kesehatan: Math.min(100, Math.max(0, Math.round(margin * 1.5 + 20))),
        kesehatanLabel: margin >= 20 ? 'Sangat Sehat' : margin > 0 ? 'Cukup Sehat' : 'Perlu Evaluasi'
      })
      showToast(isToday ? `Menampilkan data real-time: ${label}` : `Data dashboard disesuaikan: ${label}`)
    } else {
      // Date range from start to end (e.g. 26 Okt - 1 Nov, or 10 Okt - 17 Okt)
      const dates = []
      let curr = new Date(start)
      const endObj = new Date(end)
      while (curr <= endObj) {
        const y = curr.getFullYear()
        const m = String(curr.getMonth() + 1).padStart(2, '0')
        const d = String(curr.getDate()).padStart(2, '0')
        dates.push(`${y}-${m}-${d}`)
        curr.setDate(curr.getDate() + 1)
      }

      let totalOmzet = 0
      let totalLaba = 0
      let totalTransaksi = 0

      const fullTrend = dates.map((dateStr) => {
        const d = DAILY_RECORDS[dateStr] || { omzet: 0, laba: 0, transaksi: 0 }
        totalOmzet += d.omzet
        totalLaba += d.laba
        totalTransaksi += d.transaksi
        return {
          day: formatDayMonth(dateStr),
          omzet: d.omzet,
          laba: d.laba
        }
      })

      // Sample down to 7 points if more than 7 days
      let chartTrend = fullTrend
      if (dates.length > 7) {
        const step = (dates.length - 1) / 6
        chartTrend = [0, 1, 2, 3, 4, 5, 6].map((i) => fullTrend[Math.round(i * step)])
      }

      // Calculate real preceding range of equal duration
      const rangeLen = dates.length
      const prevDates = []
      for (let i = rangeLen; i >= 1; i--) {
        const pObj = new Date(start)
        pObj.setDate(pObj.getDate() - i)
        const yP = pObj.getFullYear()
        const mP = String(pObj.getMonth() + 1).padStart(2, '0')
        const dP = String(pObj.getDate()).padStart(2, '0')
        prevDates.push(`${yP}-${mP}-${dP}`)
      }

      const fullPrevTrend = prevDates.map((dateStr) => {
        const d = DAILY_RECORDS[dateStr] || { omzet: 0, laba: 0, transaksi: 0 }
        return {
          day: formatDayMonth(dateStr),
          omzet: d.omzet,
          laba: d.laba
        }
      })

      let chartPrevTrend = fullPrevTrend
      if (prevDates.length > 7) {
        const step = (prevDates.length - 1) / 6
        chartPrevTrend = [0, 1, 2, 3, 4, 5, 6].map((i) => fullPrevTrend[Math.round(i * step)])
      }

      const label = `${formatDayMonth(start)} - ${formatDayMonth(end)} 2026`
      setSelectedDateFilter(label)
      setChartTitle(`Analisis Omzet & Laba Bersih (${label})`)
      setChartSubtitle(`Akumulasi performa finansial usaha selama ${dates.length} hari operasional.`)
      setTrendData(chartTrend)
      setPrevTrendData(chartPrevTrend)

      const avgPerStruk = totalTransaksi > 0 ? Math.round(totalOmzet / totalTransaksi) : 0
      const marginPct = totalOmzet > 0 ? Math.round((totalLaba / totalOmzet) * 100) : 38

      setKpiStats({
        untung: totalLaba,
        untungGrowth: `Akumulasi ${dates.length} Hari`,
        omzet: totalOmzet,
        omzetGrowth: `Rata-rata Rp${Math.round(totalOmzet / dates.length).toLocaleString('id-ID')}/hari`,
        transaksi: totalTransaksi,
        transaksiSub: `Rata-rata Rp${avgPerStruk.toLocaleString('id-ID')}/struk`,
        kesehatan: Math.min(96, Math.max(72, Math.round(72 + marginPct * 0.4))),
        kesehatanLabel: marginPct >= 35 ? 'Sangat Sehat' : 'Sehat'
      })
      showToast(`Data diakumulasikan untuk periode: ${label} (${dates.length} hari)`)
    }

    setIsDatePickerOpen(false)
  }

  const handleSelectDate = (option) => {
    setSelectedDateFilter(option.label)
    setKpiStats(option.stats)
    if (option.trend) {
      setTrendData(option.trend)
    }
    if (option.prevTrend) {
      setPrevTrendData(option.prevTrend)
    }
    setIsDatePickerOpen(false)
    showToast(`Data dashboard disesuaikan: ${option.label}`)
  }

  const handleAdjustCroissantPrice = () => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === 1 ? { ...item, price: 13000, status: 'Sehat' } : item
      )
    )
    updateRealtimeData(0, 30000, 'Harga Croissant Naik ke Rp13.000')
    showToast('Harga Croissant Cokelat berhasil disesuaikan ke Rp13.000! Laba naik.')
  }

  const handleSendChatMessage = async (customPrompt = null) => {
    const text = (typeof customPrompt === 'string' ? customPrompt : chatInput).trim()
    if (!text || chatLoading) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await api.post('/ai/chat', { message: text })
      const reply = res.data?.data?.reply || 'Terima kasih atas pertanyaannya. Terus pantau laba dan margin resep Anda!'
      const source = res.data?.data?.source || 'gemini'
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: reply,
          source: source,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } catch (err) {
      console.error('Chat AI failed:', err)
      const errReply =
        err.response?.data?.message ||
        'Maaf, koneksi ke asisten AI sedang sibuk. Namun Anda dapat memeriksa evaluasi margin produk langsung di menu Katalog & HPP.'
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: errReply,
          source: 'fallback',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleResetChat = () => {
    setChatMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: 'Halo! Saya UntungJelas AI. Saya siap membantu menganalisis struktur HPP resep, mengevaluasi menu dengan margin tipis, atau memberi rekomendasi penyesuaian harga jual. Ada yang ingin Anda diskusikan hari ini?',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
    ])
    showToast('Percakapan telah direset.')
  }

  const handleAskAi = (e, customQuery = null) => {
    if (e && e.preventDefault) e.preventDefault()
    const query = (customQuery || aiQuestion).trim()
    if (!query) return
    setActiveMenu('Asisten AI')
    handleSendChatMessage(query)
    setAiQuestion('')
  }

  const handleSavePriceEdit = (id, newHpp, newPrice) => {
    const oldProduct = products.find((p) => p.id === id)
    const oldMargin = oldProduct ? oldProduct.price - oldProduct.hpp : 0
    const newMargin = Number(newPrice) - Number(newHpp)
    const deltaProfit = (newMargin - oldMargin) * 4

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
    if (deltaProfit !== 0) {
      updateRealtimeData(0, deltaProfit, `Revisi Harga ${oldProduct?.name || ''}`)
    }
    setShowEditModal(null)
    showToast('Data produk & HPP berhasil diperbarui!')
  }

  const handleMarkAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    showToast('Semua notifikasi telah ditandai dibaca.')
  }

  // POS Cart Calculations (Real-time live calculation)
  const cartSubtotal = posCart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartHpp = posCart.reduce((sum, item) => sum + (item.hpp || Math.round(item.price * 0.6)) * item.qty, 0)
  const cartProfit = Math.max(0, cartSubtotal - cartHpp)
  const cartMarginPct = cartSubtotal > 0 ? ((cartProfit / cartSubtotal) * 100).toFixed(1) : '0'

  const handleAddToCart = (product) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          hpp: product.hpp,
          qty: 1,
          note: product.defaultNote || '',
          image: product.image,
        }
      ]
    })
    showToast(`${product.name} ditambahkan ke pesanan`)
  }

  const handleUpdateQty = (id, delta) => {
    setPosCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    )
  }

  const handleRemoveFromCart = (id) => {
    setPosCart((prev) => prev.filter((item) => item.id !== id))
    showToast('Menu dihapus dari pesanan')
  }

  const handleResetCart = () => {
    setPosCart([])
    showToast('Pesanan telah di-reset')
  }

  const handleCompletePayment = async (method) => {
    if (posCart.length === 0 || checkoutLoading) return

    setCheckoutLoading(true)
    try {
      const payload = {
        paid_at: new Date().toISOString(),
        payment_method: method || 'Tunai',
        items: posCart.map((item) => ({
          product_id: item.id,
          qty: item.qty,
        })),
      }

      const res = await api.post('/transactions', payload)
      const data = res.data?.data

      const profitReal = Number(data?.profit ?? data?.total_profit ?? cartProfit)
      const totalReal = Number(data?.total ?? cartSubtotal)
      const costReal = Number(data?.total_cost ?? cartHpp)
      const shortUuid = data?.uuid ? data.uuid.substring(0, 8).toUpperCase() : Math.floor(100 + Math.random() * 900)

      const receiptData = {
        txId: `#TX-${shortUuid}`,
        uuid: data?.uuid,
        receiptUrl: data?.receipt_url,
        method: method,
        items: [...posCart],
        subtotal: totalReal,
        hpp: costReal,
        profit: profitReal,
        margin: totalReal > 0 ? ((profitReal / totalReal) * 100).toFixed(1) : cartMarginPct,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }

      setPosShiftProfit((prev) => prev + profitReal)
      setPosCart([])
      setPosReceiptModal(receiptData)
      updateRealtimeData(totalReal, profitReal, `Kasir: ${method}`)
      fetchDashboardStats()
      fetchHealthScore()
      fetchRecentTransactions()
      showToast(`Transaksi berhasil via ${method}! Laba Rp${profitReal.toLocaleString('id-ID')} dicatat.`)
    } catch (err) {
      console.error('Gagal mencatat transaksi:', err)
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null) ||
        'Gagal mencatat transaksi kasir. Pastikan semua produk telah memiliki modal HPP.'
      showToast(`Gagal: ${errorMsg}`)
      alert(`Pemberitahuan Kasir:\n${errorMsg}`)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const menuUtama = [
    { name: 'Dashboard', icon: LayoutGrid },
    { name: 'Kasir', icon: Store },
    { name: 'Katalog & HPP', icon: Calculator },
    { name: 'Laporan Keuangan', icon: BarChart3 },
    { name: 'Asisten AI', icon: Sparkles },
  ]

  const menuUmum = [
    { name: 'Pengaturan Toko', icon: Settings },
    { name: 'Help', icon: HelpCircle },
  ]

  // ================= UNTUNGJELAS REAL-TIME DYNAMIC COORDINATES & CURVES =================
  const nPoints = trendData.length
  const startX = 24
  const endX = 676
  const xCoords = trendData.map((_, i) =>
    nPoints > 1 ? Math.round(startX + (i * (endX - startX)) / (nPoints - 1)) : 350
  )

  // Unified Max Scale for Omzet, Laba, Biaya, and Real Previous Period
  const maxVal = Math.max(
    ...trendData.map((d) => Math.max(d.omzet || 0, d.laba || 0, d.costs ?? Math.max(0, d.omzet - d.laba))),
    ...(comparePrevious ? prevTrendData.map((d) => d.omzet || 0) : []),
    500000
  )
  const chartMaxY = Math.max(400000, Math.ceil(maxVal / 100000) * 100000)

  // getY mapping: val 0 -> 180 (baseline), val max -> 16 (top line) (height range = 164px)
  const getY = (val) => {
    const clamped = Math.max(0, val)
    return 180 - (clamped / chartMaxY) * 164
  }

  // Smooth Bezier Spline Path Generator
  const getSmoothSvgPath = (coords) => {
    if (!coords || coords.length === 0) return ''
    if (coords.length === 1) return `M ${coords[0][0]},${coords[0][1]}`
    
    let d = `M ${coords[0][0]},${coords[0][1]}`
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1]
      const p1 = coords[i]
      const p2 = coords[i + 1]
      const p3 = coords[i + 2] || p2

      const cp1x = p1[0] + (p2[0] - p0[0]) / 5
      const cp1y = p1[1] + (p2[1] - p0[1]) / 5
      const cp2x = p2[0] - (p3[0] - p1[0]) / 5
      const cp2y = p2[1] - (p3[1] - p1[1]) / 5

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0]},${p2[1]}`
    }
    return d
  }

  const omzetCoords = trendData.map((d, i) => [xCoords[i], getY(d.omzet)])
  const labaCoords = trendData.map((d, i) => [xCoords[i], getY(d.laba)])
  const costCoords = trendData.map((d, i) => [xCoords[i], getY(d.costs ?? Math.max(0, d.omzet - d.laba))])
  const prevCoords = prevTrendData.map((d, i) => [xCoords[i] || 350, getY(d.omzet)])

  const omzetPath = getSmoothSvgPath(omzetCoords)
  const labaPath = getSmoothSvgPath(labaCoords)
  const labaArea = labaCoords.length > 0 ? `${labaPath} L ${xCoords[nPoints - 1]},180 L ${xCoords[0]},180 Z` : ''
  const costPath = getSmoothSvgPath(costCoords)
  const prevPath = getSmoothSvgPath(prevCoords)

  const activeIdx = activeChartIndex !== null && activeChartIndex < trendData.length ? activeChartIndex : trendData.length - 1
  const activePointData = trendData[activeIdx] || { day: 'Hari Ini', omzet: 0, laba: 0 }
  const activePointCosts = activePointData.costs ?? Math.max(0, activePointData.omzet - activePointData.laba)
  const prevPointData = prevTrendData[activeIdx] || { day: 'Lalu', omzet: 0, laba: 0 }
  const prevDiffOmzet = activePointData.omzet - prevPointData.omzet
  const prevDiffPct = prevPointData.omzet > 0 ? ((prevDiffOmzet / prevPointData.omzet) * 100).toFixed(1) : '0'
  const isLatestPoint = activeIdx === trendData.length - 1
  const activePointDateStr = activePointData.day.includes(':')
    ? `${activePointData.day} • ${selectedDateFilter.split('(')[0].trim()}`
    : (activePointData.day.includes('2026') ? activePointData.day : `${activePointData.day} 2026`)

  const formatShortVal = (val, isCompact = false) => {
    if (val === 0) return 'Rp0'
    if (val >= 1000000) {
      const jt = val / 1000000
      return `Rp${jt % 1 === 0 ? jt : jt.toFixed(1)}jt`
    }
    if (val >= 1000) {
      return `Rp${Math.round(val / 1000)}rb`
    }
    return `Rp${val}`
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-gray-900 flex antialiased">
      
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] m-4 mr-0 p-6 justify-between flex-shrink-0 min-h-[calc(100vh-2rem)] sticky top-4 self-start">
        {/* Top: Logo & Menu Utama */}
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-2.5 px-2 mb-8 cursor-pointer select-none" onClick={() => setActiveMenu('Dashboard')}>
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
        </div>

        {/* Bottom: Bagian UMUM & Tombol Keluar (Turun ke bawah sesuai mockup) */}
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
          <div className="mt-6">
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

                  {/* Keluar Button Mobile */}
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
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-7 min-w-0">
        
        {/* ================= 1. TOP HEADER BAR (STICKY) ================= */}
        <header className="sticky top-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-5 sm:px-6 py-3 flex items-center justify-between mb-6">
          
          {/* Left: Hamburger & Search Bar with Autocomplete */}
          <div className="flex items-center gap-3 flex-1 max-w-md relative" ref={searchRef}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                placeholder="Cari transaksi, menu, resep..."
                className="w-full bg-[#F8F9FA] rounded-full pl-9 pr-8 py-2 text-xs sm:text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#009B5B]/40 focus:bg-white border border-transparent focus:border-gray-200 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Autocomplete Search Box */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2.5 z-50 max-h-80 overflow-y-auto animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                  <span>Hasil Pencarian</span>
                  <span>{filteredSearchResults.length} ditemukan</span>
                </div>

                {filteredSearchResults.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {filteredSearchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setIsSearchOpen(false)
                          showToast(`Membuka detail: ${item.title}`)
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                              item.type === 'Produk'
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.type === 'Transaksi'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.type}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-gray-800 group-hover:text-[#009B5B] transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400">
                    Tidak ada menu, transaksi, atau resep yang cocok.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Notifications (🔔) & Profile (Kedai Kopi Nabila) */}
          <div className="flex items-center gap-3 sm:gap-3.5 ml-4">
            
            {/* ================= 2. NOTIFIKASI BELL POPOVER ================= */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#F4F5F7] hover:bg-gray-200/80 flex items-center justify-center transition-colors cursor-pointer select-none"
                aria-label="Notifikasi"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black text-black stroke-[1.2]" />
              </button>

              {/* Notification Popover Panel */}
              {isNotificationOpen && (
                <>
                  {/* Mobile Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/25 backdrop-blur-xs z-40 sm:hidden"
                    onClick={() => setIsNotificationOpen(false)}
                  />

                  <div className="fixed inset-x-3 top-20 sm:top-full max-w-sm sm:max-w-none mx-auto sm:mx-0 z-50 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-88 bg-white rounded-3xl sm:rounded-2xl shadow-2xl sm:shadow-xl border border-gray-100 p-4 select-none animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">Notifikasi Toko</h4>
                        <p className="text-[10px] text-gray-400">{unreadCount} pesan belum dibaca</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllNotifications}
                            className="text-[11px] font-semibold text-[#009B5B] hover:underline cursor-pointer"
                          >
                            Tandai dibaca
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsNotificationOpen(false)}
                          className="sm:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                          title="Tutup"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-50 my-2 max-h-72 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`py-3 px-1.5 flex gap-3 transition-colors rounded-xl ${
                            notif.read ? 'opacity-60' : 'bg-emerald-50/20'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              notif.type === 'danger'
                                ? 'bg-rose-50 text-rose-500'
                                : notif.type === 'warning'
                                ? 'bg-amber-50 text-amber-500'
                                : 'bg-blue-50 text-blue-500'
                            }`}
                          >
                            {notif.type === 'danger' && <AlertTriangle className="w-4 h-4" />}
                            {notif.type === 'warning' && <Sparkles className="w-4 h-4" />}
                            {notif.type === 'info' && <FileSpreadsheet className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 leading-snug break-words">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed break-words">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-gray-400 font-medium block mt-1">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationOpen(false)
                          showToast('Membuka pusat riwayat notifikasi...')
                        }}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                      >
                        Lihat Semua Riwayat
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ================= 3. USER PROFILE DROPDOWN ================= */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 sm:gap-2.5 py-1 hover:opacity-90 transition-opacity cursor-pointer text-left select-none"
              >
                <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full overflow-hidden flex-shrink-0 bg-[#EBF8F2] border border-[#BCE8D3] flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.business_name || user?.name || 'Profil'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-[#009B5B]">
                      {(user?.name || 'Owner')
                        .trim()
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase() || '')
                        .join('') || 'UJ'}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-gray-900 tracking-tight hidden min-[400px]:inline-block">
                  {user?.business_name || 'Kedai Kopi Nabila'}
                </span>
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileOpen && (
                <>
                  {/* Mobile Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/25 backdrop-blur-xs z-40 sm:hidden"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in">
                  {/* User Profile Card Header */}
                  <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-[#EBF8F2] border border-[#BCE8D3] flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.name || 'Profil'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#009B5B]">
                          {(user?.name || 'Owner')
                            .trim()
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0]?.toUpperCase() || '')
                            .join('') || 'UJ'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Pemilik Usaha'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.phone || user?.email || 'Akun Terdaftar'}</p>
                      {user?.business_name && (
                        <p className="text-[10px] text-emerald-600 font-semibold truncate mt-0.5">{user.business_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Profile Actions */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false)
                        setActiveMenu('Pengaturan Toko')
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-400" />
                      <span>Pengaturan Akun & Toko</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false)
                        showToast(`Shift aktif: Shift ${shiftInfo.active} (${shiftInfo.time}) oleh ${shiftInfo.kasir}`)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Ganti Shift Kasir</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">
                        Shift {shiftInfo.active}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false)
                        setActiveMenu('Help')
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                      <span>Pusat Bantuan & Panduan</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false)
                        onLogout()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50/60 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500 stroke-[2]" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          </div>
        </header>

        {/* ================= IF ACTIVE MENU IS KASIR (POS) ================= */}
        {activeMenu === 'Kasir' ? (
          <div className="space-y-4 animate-fade-in">

            {/* Main Dual-Pane POS Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              
              {/* ================= LEFT PANE: PRODUCT CATALOG (8 COLS) ================= */}
              <div className="xl:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between space-y-4">
                
                {/* Search Bar Input */}
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Cari nama produk, SKU, atau bahan baku kopi..."
                    className="w-full pl-10 pr-9 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200/90 rounded-2xl text-xs sm:text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009B5B]/20 focus:border-[#009B5B] transition-all"
                  />
                  {posSearch && (
                    <button
                      type="button"
                      onClick={() => setPosSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {availablePosCategories.map((cat) => {
                    const CatIcon = cat.icon
                    const isSelected = posCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPosCategory(cat.id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#009F58] text-white shadow-xs'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setPosCategory(posCategory === 'Favorit' ? 'Semua' : 'Favorit')}
                    title="Menu Favorit"
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      posCategory === 'Favorit'
                        ? 'bg-amber-400 text-white border-amber-400 shadow-xs'
                        : 'bg-white hover:bg-gray-50 text-gray-400 hover:text-amber-500 border-gray-200/90'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                {/* Product Cards Grid (3 Columns) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {loadingProducts ? (
                    <div className="col-span-2 sm:col-span-3 py-16 text-center text-gray-400">
                      <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#009B5B] mb-2" />
                      <p className="text-xs font-medium">Memuat katalog produk...</p>
                    </div>
                  ) : posCatalog.length === 0 ? (
                    <div className="col-span-2 sm:col-span-3 py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#009B5B] flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-800">Belum ada produk, tambah dulu di Katalog & HPP</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">Tambahkan resep dan modal produk Anda agar siap dijual di kasir.</p>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('Katalog & HPP')}
                        className="inline-flex items-center gap-2 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buka Katalog & HPP</span>
                      </button>
                    </div>
                  ) : (
                    posCatalog
                      .filter((p) => {
                        const matchesCategory =
                          posCategory === 'Semua'
                            ? true
                            : posCategory === 'Favorit'
                            ? p.popular
                            : p.category === posCategory
                        const matchesSearch =
                          !posSearch ||
                          p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
                          p.desc.toLowerCase().includes(posSearch.toLowerCase())
                        return matchesCategory && matchesSearch
                      })
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleAddToCart(item)}
                          className="bg-white rounded-2xl border border-gray-100 hover:border-[#009B5B] p-3 sm:p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98] relative overflow-hidden"
                        >

                          {/* Product Image / Consistent Placeholder */}
                          <div className="h-24 sm:h-28 w-full flex items-center justify-center my-1 relative">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-xs"
                              />
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-200/60 flex flex-col items-center justify-center text-emerald-800 shadow-xs group-hover:scale-105 transition-transform">
                                <span className="text-base sm:text-lg font-black tracking-wider text-[#009B5B]">
                                  {item.name ? item.name.substring(0, 2).toUpperCase() : 'UJ'}
                                </span>
                                <span className="text-[9px] font-semibold text-emerald-600/80">Menu</span>
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="mt-1">
                            <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-snug line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                              {item.desc}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-black text-[#009B5B]">
                                Rp{item.price.toLocaleString('id-ID')}
                              </span>
                              <span className="w-6 h-6 rounded-lg bg-gray-100 group-hover:bg-[#009B5B] group-hover:text-white text-gray-600 flex items-center justify-center text-xs font-bold transition-all shadow-2xs">
                                +
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Bottom Bar: Shift Profit */}
                <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400">Untung shift ini</span>
                    <strong className="text-gray-900 font-bold">Rp{posShiftProfit.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#009B5B] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((posShiftProfit / 600000) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500">
                      {((posShiftProfit / 600000) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

              </div>

              {/* ================= RIGHT PANE: ORDER / CART PANEL (4 COLS) ================= */}
              <div className="xl:col-span-4 bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
                
                {/* Header Pesanan */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">Pesanan Saat Ini</h3>
                    {posCart.length > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {posCart.reduce((sum, it) => sum + it.qty, 0)} item
                      </span>
                    )}
                  </div>
                  {posCart.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetCart}
                      className="text-xs font-semibold text-gray-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                      title="Kosongkan Pesanan"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:thin]">
                  {posCart.length > 0 ? (
                    posCart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50/70 hover:bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0 shadow-2xs">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#009B5B] flex items-center justify-center text-xs font-black border border-emerald-100">
                              {item.name ? item.name.substring(0, 2).toUpperCase() : 'UJ'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-xs font-bold text-gray-900 truncate">{item.name}</h5>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-gray-300 hover:text-rose-500 p-0.5 transition-colors cursor-pointer flex-shrink-0"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.note && (
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.note}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 rounded-lg p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, -1)}
                                className="w-5 h-5 rounded-md hover:bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-gray-900 w-5 text-center">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, 1)}
                                className="w-5 h-5 rounded-md bg-[#009B5B] hover:bg-[#00874e] text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs sm:text-[13px] font-black text-gray-900">
                              Rp{(item.price * item.qty).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 px-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-2.5 text-gray-300">
                        <Store className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">Belum ada pesanan</p>
                      <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        Klik produk di katalog untuk menambahkan pesanan ke keranjang
                      </p>
                    </div>
                  )}
                </div>

                {/* Financial Intelligence Breakdown Card */}
                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Subtotal Pesanan</span>
                    <span className="font-bold text-gray-900 text-sm">
                      Rp{cartSubtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Estimasi Modal (HPP)</span>
                    <span className="font-semibold text-gray-700">
                      Rp{cartHpp.toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <div className="pt-2.5 border-t border-gray-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900">Untung Bersih</span>
                      {cartMarginPct > 0 && (
                        <span className="text-[10px] font-black text-[#009F58] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          {cartMarginPct}%
                        </span>
                      )}
                    </div>
                    <span className="text-base font-black text-[#009F58]">
                      +Rp{cartProfit.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Pilih Pembayaran
                  </p>
                  <div className="p-1 bg-gray-100/90 rounded-2xl flex items-center gap-1 border border-gray-200/50">
                    {/* 1. Tunai (Icon Money / Banknote) */}
                    <button
                      type="button"
                      title="Pembayaran Tunai"
                      onClick={() => setPosPaymentMethod('Tunai')}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center h-10 ${
                        posPaymentMethod === 'Tunai'
                          ? 'bg-white text-gray-900 shadow-xs border border-gray-200/70'
                          : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 border border-transparent'
                      }`}
                    >
                      <Banknote className={`w-5 h-5 transition-colors ${posPaymentMethod === 'Tunai' ? 'text-gray-900 stroke-[2]' : 'text-gray-400 stroke-[1.8]'}`} />
                    </button>

                    {/* 2. QRIS (Logo QRIS) */}
                    <button
                      type="button"
                      title="Pembayaran QRIS"
                      onClick={() => setPosPaymentMethod('QRIS')}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center h-10 ${
                        posPaymentMethod === 'QRIS'
                          ? 'bg-white text-gray-900 shadow-xs border border-gray-200/70'
                          : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 border border-transparent'
                      }`}
                    >
                      <img
                        src="/assets/kasir/qris-logo.png"
                        alt="QRIS"
                        className={`h-4 max-w-[58px] object-contain transition-all ${
                          posPaymentMethod === 'QRIS' ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                        }`}
                      />
                    </button>

                    {/* 3. Debit (Logo Kartu Debit) */}
                    <button
                      type="button"
                      title="Pembayaran Kartu Debit"
                      onClick={() => setPosPaymentMethod('Kartu/Debit')}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center h-10 ${
                        posPaymentMethod === 'Kartu/Debit'
                          ? 'bg-white text-gray-900 shadow-xs border border-gray-200/70'
                          : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 border border-transparent'
                      }`}
                    >
                      <img
                        src="/assets/kasir/debit-logo.png"
                        alt="Debit"
                        className={`h-5 w-auto object-contain transition-all ${
                          posPaymentMethod === 'Kartu/Debit' ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Checkout Section: Clean, Professional POS Hierarchy */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-baseline justify-between px-0.5">
                    <span className="text-xs font-semibold text-gray-500">Total Tagihan</span>
                    <span className="text-xl font-black text-gray-900 tracking-tight">
                      Rp{cartSubtotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={posCart.length === 0 || checkoutLoading}
                    onClick={() => handleCompletePayment(posPaymentMethod)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      posCart.length > 0 && !checkoutLoading
                        ? 'bg-[#009F58] hover:bg-[#008f4f] text-white shadow-sm hover:shadow active:scale-[0.99] cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/60'
                    }`}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Memproses Transaksi...</span>
                      </>
                    ) : (
                      <>
                        <span>{posCart.length > 0 ? 'Bayar Sekarang' : 'Pilih Menu Terlebih Dahulu'}</span>
                        {posCart.length > 0 && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Modal: Struk Transaksi Selesai */}
            {posReceiptModal && typeof document !== 'undefined' && createPortal(
              <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm m-0">
                <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 text-center relative animate-fade-in max-h-[90vh] overflow-y-auto">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#009B5B] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Pembayaran Berhasil!
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Transaksi {posReceiptModal.txId} telah dibukukan ke kasir.
                  </p>

                  {/* Struk Paper Preview */}
                  <div className="my-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-left text-xs space-y-2">
                    <div className="flex justify-between font-bold text-gray-900 pb-2 border-b border-gray-200">
                      <span>{user?.business_name || 'Kedai Usaha'}</span>
                      <span>{posReceiptModal.time}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      <span>Pesanan Kasir • {posReceiptModal.method}</span>
                    </div>

                    <div className="py-2 border-y border-dashed border-gray-200 space-y-1">
                      {posReceiptModal.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-700">{it.qty}x {it.name}</span>
                          <span className="font-semibold text-gray-900">Rp{(it.price * it.qty).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 pt-1 text-[11px]">
                      <div className="flex justify-between text-gray-600">
                        <span>Total Penjualan:</span>
                        <span className="font-bold text-gray-900">Rp{posReceiptModal.subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Modal Bahan (HPP):</span>
                        <span>Rp{posReceiptModal.hpp.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#009B5B]">
                        <span>Untung Bersih ({posReceiptModal.margin}%):</span>
                        <span>+Rp{posReceiptModal.profit.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {posReceiptModal.uuid && (
                      <div className="grid grid-cols-2 gap-2 pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            window.open(`/#struk/${posReceiptModal.uuid}`, '_blank')
                          }}
                          className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#009B5B] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Buka Struk</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${window.location.origin}/#struk/${posReceiptModal.uuid}`
                            navigator.clipboard.writeText(link)
                            showToast('Tautan struk digital disalin!')
                          }}
                          className="py-2 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Salin Tautan</span>
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Mencetak struk kasir thermal 58mm...')
                        setPosReceiptModal(null)
                      }}
                      className="w-full py-2.5 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Struk Thermal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosReceiptModal(null)}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Tutup & Pesanan Baru
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}



          </div>
        ) : activeMenu === 'Katalog & HPP' ? (
          <KatalogHppPage
            catalog={posCatalog}
            onUpdateCatalog={setPosCatalog}
            onToast={showToast}
          />
        ) : activeMenu === 'Laporan Keuangan' ? (
          <LaporanKeuanganPage onToast={showToast} onNavigateMenu={setActiveMenu} />
        ) : activeMenu === 'Asisten AI' ? (
          <div className="space-y-5 animate-fade-in pb-12">
            
            {/* Header Asisten AI */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Konsultasi & Analisis Usaha
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Konsultasikan simulasi HPP, evaluasi margin menu, dan strategi harga jual langsung dari data toko Anda.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-gray-700 border border-gray-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#009B5B]"></span>
                  <span>Data Toko Terhubung</span>
                </span>
              </div>
            </div>

            {/* 2-Column Responsive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Main Column (8 cols): Modern Spacious Chat Workspace */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col h-[620px]">
                
                {/* Chat Header Bar */}
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EBF8F2] border border-[#BCE8D3] flex items-center justify-center text-[#009B5B] shadow-2xs shrink-0">
                      <Sparkles className="w-4 h-4 text-[#009B5B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                        UntungJelas AI
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Asisten Finansial & Margin Usaha
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetChat}
                    className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Mulai percakapan baru"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Bersihkan</span>
                  </button>
                </div>

                {/* Chat Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gray-50/30">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {msg.sender === 'ai' ? (
                        <div className="flex flex-col items-start gap-1.5 max-w-[88%] sm:max-w-[82%]">
                          {/* AI Avatar & Name Header */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#EBF8F2] border border-[#BCE8D3] flex items-center justify-center text-[#009B5B] shadow-2xs shrink-0">
                              <Sparkles className="w-3.5 h-3.5 text-[#009B5B]" />
                            </div>
                            <span className="font-bold text-xs sm:text-sm text-gray-900">
                              UntungJelas AI
                            </span>
                          </div>
                          {/* AI Message Bubble */}
                          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-xs sm:text-[13px] leading-relaxed shadow-2xs bg-white text-gray-800 border border-gray-200/80 rounded-tl-sm whitespace-pre-line ml-1">
                            {msg.text}
                            <div className="text-[10px] mt-2 flex items-center gap-1.5 text-gray-400 font-normal">
                              <span>{msg.time}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 justify-end max-w-[90%] sm:max-w-[82%] ml-auto">
                          {/* User Message Bubble */}
                          <div className="rounded-2xl sm:rounded-3xl px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs bg-[#009B5B] text-white rounded-tr-sm">
                            <p className="font-medium text-white">{msg.text}</p>
                            <div className="text-[10px] mt-1.5 flex items-center justify-end text-emerald-100/90 font-normal">
                              <span>{msg.time}</span>
                            </div>
                          </div>
                          {/* User Profile Avatar */}
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0 mt-0.5 border border-[#BCE8D3] shadow-2xs bg-[#EBF8F2] flex items-center justify-center">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user?.name || "Profil"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[11px] font-bold text-[#009B5B]">
                                {(user?.name || 'Owner')
                                  .trim()
                                  .split(' ')
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((w) => w[0]?.toUpperCase() || '')
                                  .join('') || 'UJ'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#EBF8F2] border border-[#BCE8D3] flex items-center justify-center text-[#009B5B] shadow-2xs shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-[#009B5B]" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-gray-900">
                          UntungJelas AI
                        </span>
                      </div>
                      <div className="bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl rounded-tl-sm p-4 text-xs text-gray-500 flex items-center gap-2.5 shadow-2xs ml-1">
                        <Loader2 className="w-4 h-4 animate-spin text-[#009B5B]" />
                        <span>Sedang menganalisis data keuangan toko Anda...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendChatMessage()
                  }}
                  className="p-3 sm:p-4 bg-white border-t border-gray-100 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanyakan analisis HPP, saran harga, atau strategi menu..."
                    disabled={chatLoading}
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="px-4 py-2.5 bg-[#009B5B] hover:bg-[#00874e] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {chatLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
                </form>

              </div>

              {/* Sidebar Column (4 cols): Business Context Panel */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Card 1: Status Toko & Skor Kesehatan Usaha */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400">
                      Data Toko Terhubung
                    </p>
                    <h3 className="text-base font-bold text-gray-900 mt-0.5">
                      {user?.business_name || user?.name || 'Kedai Kopi & Pastry Senja'}
                    </h3>
                  </div>

                  <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="font-medium">Skor Kesehatan Usaha</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        healthScoreData.score >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        healthScoreData.score >= 60 ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        healthScoreData.score >= 40 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {healthScoreData.label}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-2xl font-black text-gray-900">{healthScoreData.score}</span>
                      <span className="text-xs font-semibold text-gray-400">/ 100</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                      {healthScoreData.saran?.[0] || 'Pertahankan pencatatan kasir secara teratur untuk menjaga kestabilan margin.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-gray-800">{insightData.headline || 'Evaluasi Margin Resep'}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {insightData.text || 'Gunakan simulasi resep di Katalog & HPP jika ingin menguji dampak kenaikan harga bahan baku terhadap margin kotor.'}
                    </p>
                  </div>
                </div>

                {/* Card 2: Panduan Topik Populer */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 tracking-tight">
                    Topik Siap Ditanyakan
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        label: 'Menu Margin Tipis',
                        prompt: 'Menu mana saja di katalog saya yang marginnya di bawah 30% dan perlu dievaluasi?'
                      },
                      {
                        label: 'Simulasi Kenaikan Bahan',
                        prompt: 'Jika harga bahan baku utama naik 10%, berapa harga jual yang aman agar margin tetap sehat?'
                      },
                      {
                        label: 'Strategi Bundling Menu',
                        prompt: 'Bagaimana cara membuat paket menu bundling untuk meningkatkan nilai belanja rata-rata (AOV)?'
                      },
                      {
                        label: 'Tips Efisiensi Bahan',
                        prompt: 'Bagaimana cara meminimalkan food waste atau sisa bahan baku di operasional harian?'
                      }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChatMessage(item.prompt)}
                        disabled={chatLoading}
                        className="w-full text-left p-2.5 rounded-xl bg-gray-50/70 hover:bg-gray-100/90 border border-gray-100 transition-colors text-xs text-gray-700 font-medium flex items-center justify-between group cursor-pointer disabled:opacity-50"
                      >
                        <span className="line-clamp-1">{item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0 ml-1.5" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : activeMenu === 'Pengaturan Toko' ? (
          <SettingsPage
            user={user}
            onToast={showToast}
            onUpdateUser={updateUser}
          />
        ) : activeMenu === 'Help' ? (
          <HelpPage
            onNavigateMenu={setActiveMenu}
            onToast={showToast}
          />
        ) : (
          /* ================= MAIN DASHBOARD CONTENT ================= */
          <>
            {/* Greeting & Date / Quick Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight">
                  Halo, {user?.name ? user.name.split(' ')[0] : 'Juragan'}!
                </h1>
                <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5">
                  Berikut ringkasan performa finansial <span className="font-semibold text-gray-700">{user?.business_name || 'usaha Anda'}</span> hari ini.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                
                {/* ================= 4. FILTER TANGGAL (INTERACTIVE CALENDAR & ACCUMULATION) ================= */}
                <div className="relative" ref={datePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      const nextOpen = !isDatePickerOpen
                      setIsDatePickerOpen(nextOpen)
                      if (nextOpen) {
                        setTempStart(selectedStartDate)
                        setTempEnd(selectedEndDate)
                        if (selectedStartDate) {
                          const [y, m] = selectedStartDate.split('-').map(Number)
                          setCalMonth({ year: y, month: m - 1 })
                        }
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200/90 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors cursor-pointer select-none"
                  >
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span className="truncate max-w-[130px] sm:max-w-none">{selectedDateFilter}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Calendar / Date Filter Dropdown */}
                  {isDatePickerOpen && (
                    <>
                      {/* Mobile Backdrop Overlay */}
                      <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 sm:hidden"
                        onClick={() => setIsDatePickerOpen(false)}
                      />

                      {/* Modal Card: Centered on mobile (< sm), dropdown below button on desktop (>= sm) */}
                      <div className="fixed inset-x-3 top-20 sm:top-full max-w-[360px] mx-auto z-50 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-[360px] bg-white rounded-3xl sm:rounded-2xl shadow-2xl border border-gray-100 p-4 select-none animate-fade-in">
                        
                        {/* Dropdown Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-900">Pilih Tanggal</p>
                            <p className="text-[10px] text-gray-400">Pilih 1 hari atau rentang tanggal</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                applyDateSelection(getTodayDateStr(), getTodayDateStr())
                              }}
                              className="text-[11px] font-bold text-[#009B5B] hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              Hari Ini
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsDatePickerOpen(false)}
                              className="sm:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                              title="Tutup"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Quick Presets row without ugly scrollbar */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          <button
                            type="button"
                            onClick={() => {
                              applyDateSelection(getTodayDateStr(), getTodayDateStr())
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                              selectedStartDate === getTodayDateStr() && selectedEndDate === getTodayDateStr()
                                ? 'bg-emerald-50 text-[#009B5B] font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Hari Ini
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const yDay = getYesterdayDateStr()
                              applyDateSelection(yDay, yDay)
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                              selectedStartDate === getYesterdayDateStr() && selectedEndDate === getYesterdayDateStr()
                                ? 'bg-emerald-50 text-[#009B5B] font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Kemarin
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              applyDateSelection(getLast7DaysStr(), getTodayDateStr())
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                              selectedStartDate === getLast7DaysStr() && selectedEndDate === getTodayDateStr()
                                ? 'bg-emerald-50 text-[#009B5B] font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            7 Hari Terakhir
                          </button>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center justify-between px-1 py-1.5 mb-1 bg-gray-50/80 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setCalMonth((prev) => {
                                let m = prev.month - 1
                                let y = prev.year
                                if (m < 0) {
                                  m = 11
                                  y -= 1
                                }
                                return { year: y, month: m }
                              })
                            }}
                            className="p-1 rounded-lg text-gray-600 hover:bg-white transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold text-gray-800">
                            {MONTH_NAMES_ID[calMonth.month]} {calMonth.year}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCalMonth((prev) => {
                                let m = prev.month + 1
                                let y = prev.year
                                if (m > 11) {
                                  m = 0
                                  y += 1
                                }
                                return { year: y, month: m }
                              })
                            }}
                            disabled={
                              calMonth.year > new Date().getFullYear() ||
                              (calMonth.year === new Date().getFullYear() && calMonth.month >= new Date().getMonth())
                            }
                            className="p-1 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Day of Week Headers */}
                        <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 py-1">
                          <span>Min</span>
                          <span>Sen</span>
                          <span>Sel</span>
                          <span>Rab</span>
                          <span>Kam</span>
                          <span>Jum</span>
                          <span>Sab</span>
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                          {Array.from({ length: new Date(calMonth.year, calMonth.month, 1).getDay() }).map((_, i) => (
                            <div key={`pad-${i}`} className="h-8" />
                          ))}

                          {Array.from({
                            length: new Date(calMonth.year, calMonth.month + 1, 0).getDate()
                          }).map((_, i) => {
                            const d = i + 1
                            const dStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                            const todayStr = getTodayDateStr()
                            const isToday = dStr === todayStr
                            const isFuture = dStr > todayStr
                            const isStart = tempStart === dStr
                            const isEnd = tempEnd === dStr
                            const isInRange = tempStart && tempEnd && dStr >= tempStart && dStr <= tempEnd

                            return (
                              <button
                                key={d}
                                type="button"
                                disabled={isFuture}
                                onClick={() => {
                                  if (isFuture) return
                                  if (!tempStart || (tempStart && tempEnd && tempStart !== tempEnd)) {
                                    // Single click selects this day
                                    setTempStart(dStr)
                                    setTempEnd(dStr)
                                  } else if (tempStart && tempEnd && tempStart === tempEnd) {
                                    if (dStr === tempStart) {
                                      setTempEnd(dStr)
                                    } else if (dStr < tempStart) {
                                      setTempEnd(tempStart)
                                      setTempStart(dStr)
                                    } else {
                                      setTempEnd(dStr)
                                    }
                                  }
                                }}
                                className={`h-8 text-xs font-medium transition-all relative flex items-center justify-center ${
                                  isFuture
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : isStart && isEnd
                                    ? 'bg-[#009B5B] text-white font-bold rounded-xl shadow-sm'
                                    : isStart
                                    ? 'bg-[#009B5B] text-white font-bold rounded-l-xl'
                                    : isEnd
                                    ? 'bg-[#009B5B] text-white font-bold rounded-r-xl'
                                    : isInRange
                                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                                    : isToday
                                    ? 'border border-[#009B5B] text-[#009B5B] font-bold rounded-xl hover:bg-emerald-50/50'
                                    : 'text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer'
                                }`}
                              >
                                <span>{d}</span>
                                {isToday && !isStart && !isEnd && (
                                  <span className="absolute bottom-0.5 w-1 h-1 bg-[#009B5B] rounded-full" />
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Footer: Preview & Action Buttons */}
                        <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between gap-2">
                          <div className="text-[11px] text-gray-600 font-medium truncate min-w-0">
                            {tempStart && tempEnd && tempStart !== tempEnd ? (
                              <span className="truncate block">
                                <strong className="text-gray-900">{formatDayMonth(tempStart)} - {formatDayMonth(tempEnd)} {new Date(tempEnd).getFullYear()}</strong>
                                <span className="text-[10px] text-gray-400 ml-1">({countDays(tempStart, tempEnd)} hari)</span>
                              </span>
                            ) : tempStart ? (
                              <span className="truncate block">
                                <strong className="text-gray-900">{tempStart === getTodayDateStr() ? getTodayLabel() : `${formatDayMonth(tempStart)} ${new Date(tempStart).getFullYear()}`}</strong>
                                <span className="text-[10px] text-gray-400 ml-1">(1 hari)</span>
                              </span>
                            ) : (
                              <span className="text-gray-400">Pilih tanggal pada kalender</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setIsDatePickerOpen(false)}
                              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (tempStart) {
                                  applyDateSelection(tempStart, tempEnd || tempStart)
                                }
                              }}
                              disabled={!tempStart}
                              className="px-3.5 py-1.5 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                            >
                              Terapkan
                            </button>
                          </div>
                        </div>

                      </div>
                    </>
                  )}
                </div>

                {/* ================= 5. TOMBOL + TRANSAKSI BARU (NAVIGATE TO KASIR) ================= */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('Kasir')
                    showToast('Membuka Halaman Kasir (POS)...')
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all hover:shadow active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Transaksi Baru</span>
                </button>

              </div>
            </div>

            {/* Error State Banner */}
            {statsError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Gagal memuat data statistik dashboard</span>
                    <span className="text-[11px] text-rose-600 font-normal">{statsError}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchDashboardStats}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {statsLoading && (
              <div className="mb-4 py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                  <span>Sinkronisasi data penjualan & modal HPP dari database...</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-400">Memuat</span>
              </div>
            )}

            {/* Empty State Banner (Hari ini belum ada transaksi) */}
            {!statsLoading && !statsError && Number(kpiStats.transaksi) === 0 && (
              <div className="mb-6 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Belum ada transaksi tercatat hari ini</span>
                    <span className="text-[11px] text-amber-700/90 font-normal">
                      Buka menu Kasir atau tekan tombol <strong>Transaksi Baru</strong> di atas untuk mulai membukukan penjualan.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('Kasir')
                    showToast('Membuka Halaman Kasir (POS)...')
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Buka Kasir
                </button>
              </div>
            )}

            {/* ================= 4 STAT CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              
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
                    {statsLoading && !dashboardStats ? (
                      <span className="inline-block w-28 h-7 bg-white/25 rounded-lg animate-pulse" />
                    ) : (
                      <RollNumberTicker value={kpiStats.untung} prefix="Rp" />
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-100 font-medium">
                  {statsLoading && !dashboardStats ? (
                    <span className="inline-block w-36 h-3.5 bg-white/20 rounded animate-pulse" />
                  ) : (
                    <>
                      <span className="inline-block">▲</span>
                      <span>{kpiStats.untungGrowth}</span>
                    </>
                  )}
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
                    {statsLoading && !dashboardStats ? (
                      <span className="inline-block w-28 h-7 bg-gray-200/70 rounded-lg animate-pulse" />
                    ) : (
                      <RollNumberTicker value={kpiStats.omzet} prefix="Rp" />
                    )}
                  </h3>
                </div>
                <div className="text-[11px] text-[#009B5B] font-semibold">
                  {statsLoading && !dashboardStats ? (
                    <span className="inline-block w-36 h-3.5 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    kpiStats.omzetGrowth
                  )}
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
                    {statsLoading && !dashboardStats ? (
                      <span className="inline-block w-20 h-7 bg-gray-200/70 rounded-lg animate-pulse" />
                    ) : (
                      `${kpiStats.transaksi} Struk`
                    )}
                  </h3>
                </div>
                <div className="text-[11px] text-gray-400 font-medium">
                  {statsLoading && !dashboardStats ? (
                    <span className="inline-block w-28 h-3.5 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    kpiStats.transaksiSub
                  )}
                </div>
              </div>

              {/* Card 4: Kesehatan Usaha (GET /api/health-score) */}
              <div
                onClick={() => setShowHealthScoreDetails(!showHealthScoreDetails)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all select-none group"
                title="Klik untuk melihat detail skor kesehatan & evaluasi AI"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-medium text-gray-500 block">
                      Kesehatan Usaha
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-[#009B5B] transition-colors font-semibold">
                      {showHealthScoreDetails ? '▲ Tutup' : '▼ Detail'}
                    </span>
                  </div>
                  <div className="flex items-baseline text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight my-1">
                    {healthScoreData.loading ? (
                      <span className="text-gray-400 text-base font-semibold">Memuat...</span>
                    ) : (
                      <>
                        <span>{healthScoreData.score ?? 0}</span>
                        <span className="text-xs font-medium text-gray-400 ml-0.5">/100</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        (healthScoreData.score ?? 0) >= 80
                          ? 'bg-[#009B5B]'
                          : (healthScoreData.score ?? 0) >= 60
                          ? 'bg-emerald-600'
                          : (healthScoreData.score ?? 0) >= 40
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    >
                      {healthScoreData.loading ? 'Menganalisis...' : healthScoreData.label}
                    </span>
                  </div>
                </div>

                {/* Semi-Circle Speedometer Gauge with Animated Needle & Arc */}
                {(() => {
                  const score = Math.min(100, Math.max(0, healthScoreData.score ?? 0))
                  const angleDeg = 180 - (score / 100) * 180
                  const angleRad = (angleDeg * Math.PI) / 180
                  const nx = (50 + 26 * Math.cos(angleRad)).toFixed(1)
                  const ny = (50 - 26 * Math.sin(angleRad)).toFixed(1)
                  const arcLength = 125.6
                  const arcOffset = (arcLength * (1 - score / 100)).toFixed(1)
                  const arcColor = score >= 75 ? '#009B5B' : score >= 50 ? '#10B981' : score >= 30 ? '#F59E0B' : '#EF4444'
                  return (
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
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke={arcColor}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={arcLength}
                          strokeDashoffset={arcOffset}
                          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                        <line
                          x1="50"
                          y1="50"
                          x2={nx}
                          y2={ny}
                          stroke="#1F2937"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{ transition: 'x2 0.8s cubic-bezier(0.16, 1, 0.3, 1), y2 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                        <circle cx="50" cy="50" r="4" fill="#1F2937" />
                      </svg>
                    </div>
                  )
                })()}
              </div>

            </div>

            {/* Health Score Expandable Details Widget */}
            {showHealthScoreDetails && (
              <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50/50 via-white to-gray-50 rounded-2xl border border-emerald-100 shadow-sm animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 text-[#009B5B] flex items-center justify-center font-bold text-xs">
                      {healthScoreData.score ?? 0}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                        Evaluasi Kesehatan Bisnis: {healthScoreData.label}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Skor otomatis dihitung dari rata-rata margin (40%), konsistensi penjualan 14 hari (30%), dan proporsi produk sehat (30%).
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100/70 text-[#009B5B] self-start sm:self-center">
                    <Sparkles className="w-3 h-3" />
                    <span>{healthScoreData.source === 'ai' ? 'Gemini AI' : 'UntungJelas Heuristic'}</span>
                  </span>
                </div>

                {healthScoreData.loading ? (
                  <div className="py-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#009B5B]" />
                    <span>Memuat rincian evaluasi kesehatan usaha...</span>
                  </div>
                ) : healthScoreData.error ? (
                  <div className="py-4 text-xs text-rose-600 bg-rose-50 rounded-xl p-3 border border-rose-100 mt-3">
                    {healthScoreData.error}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                    {/* Alasan Penilaian */}
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-2">
                      <span className="font-bold text-gray-900 block text-xs">
                        Poin Evaluasi
                      </span>
                      {healthScoreData.alasan && healthScoreData.alasan.length > 0 ? (
                        <ul className="space-y-1.5 text-gray-600 text-[11px] list-disc list-inside">
                          {healthScoreData.alasan.map((r, i) => (
                            <li key={i} className="leading-relaxed">{r}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-[11px]">Belum ada data transaksi untuk dievaluasi.</p>
                      )}
                    </div>

                    {/* Saran Tindakan */}
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-2">
                      <span className="font-bold text-gray-900 block text-xs">
                        Saran Perbaikan
                      </span>
                      {healthScoreData.saran && healthScoreData.saran.length > 0 ? (
                        <ul className="space-y-1.5 text-gray-600 text-[11px] list-disc list-inside">
                          {healthScoreData.saran.map((s, i) => (
                            <li key={i} className="leading-relaxed">{s}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-[11px]">Tercatat aman, pertahankan kinerja usaha Anda.</p>
                      )}
                    </div>

                    {/* Narasi AI */}
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">Narasi Ringkas</span>
                        <span className="text-[10px] text-gray-400">
                          {healthScoreData.source === 'ai' ? 'Analisis AI' : 'Aturan Sistem'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed italic bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                        "{healthScoreData.narasi || 'Catat transaksi setiap hari dan pastikan harga jual berada di atas HPP agar skor kesehatan meningkat.'}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= 2 COLUMN MAIN GRID ================= */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              
              {/* ================= LEFT 8 COLS: CHART & TABLE ================= */}
              <div className="xl:col-span-8 space-y-5">
                
                {/* ================= UNTUNGJELAS: ARUS KAS & KEUNTUNGAN CARD ================= */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                  
                  {/* Header Row: Title on Left, View Switcher & Options on Right */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                        {chartTitle}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                        {chartSubtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Segmented Line / Bar Switcher */}
                      <div className="bg-gray-100/80 p-0.5 sm:p-1 rounded-xl flex items-center gap-0.5 border border-gray-200/50">
                        <button
                          type="button"
                          onClick={() => setChartMode('line')}
                          title="Tampilan Grafik Garis Tren"
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            chartMode === 'line'
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Activity className="w-3.5 h-3.5 stroke-[2.2] text-[#009B5B]" />
                          <span className="hidden xs:inline">Garis</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartMode('bar')}
                          title="Tampilan Grafik Batang Komparasi"
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            chartMode === 'bar'
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <BarChart2 className="w-3.5 h-3.5 stroke-[2.2] text-gray-500" />
                          <span className="hidden xs:inline">Batang</span>
                        </button>
                      </div>

                      {/* More Options Button */}
                      <button
                        type="button"
                        onClick={() => showToast('Mempersiapkan ekspor laporan grafik & arus kas...')}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
                        title="Opsi Laporan"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sub-label Y-Axis */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-2 px-1 select-none">
                    <span>Nominal (Rp)</span>
                  </div>

                  {/* Mobile Interactive Data Bar - Clean 2-Row Flat Style (No nested cards) */}
                  <div className="lg:hidden mb-4 bg-gray-50/80 border border-gray-200/70 rounded-2xl p-3 sm:p-3.5 shadow-2xs select-none">
                    {/* Top Row: Date & Margin (Flat typography, no green card or badge) */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-200/60 select-none">
                      <div className="flex items-center gap-1.5 select-none">
                        <span className="text-xs sm:text-[13px] font-bold text-gray-900 select-none">
                          {activePointDateStr}
                        </span>
                      </div>

                      {/* Flat Margin readout (tanpa card/badge) */}
                      <div className="text-xs select-none">
                        <span className="text-gray-400 font-medium">Margin: </span>
                        <span className="font-extrabold text-[#009B5B]">
                          {activePointData.omzet > 0 ? ((activePointData.laba / activePointData.omzet) * 100).toFixed(1) : '0'}%
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: 3 Columns Flat Grid (tanpa card/box untuk Omzet, Untung, dan Biaya HPP) */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {/* Omzet Column */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5] flex-shrink-0" />
                          <span className="truncate">Omzet</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          Rp{activePointData.omzet.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Untung Column */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#009B5B] flex-shrink-0" />
                          <span className="truncate">Untung</span>
                        </div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#009B5B] truncate">
                          Rp{activePointData.laba.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Biaya HPP Column */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] flex-shrink-0" />
                          <span className="truncate">Biaya HPP</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                          Rp{activePointCosts.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {/* Previous Period Real Data Comparison (when enabled) */}
                    {comparePrevious && prevPointData && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200/80 flex items-center justify-between gap-3 text-[11px]">
                        <div className="flex items-center gap-1 text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>Periode Lalu ({prevPointData.day}): <strong className="text-gray-700 font-semibold">Rp{prevPointData.omzet.toLocaleString('id-ID')}</strong></span>
                        </div>
                        <span className={`font-bold whitespace-nowrap ${prevDiffOmzet >= 0 ? 'text-[#009B5B]' : 'text-rose-500'}`}>
                          {prevDiffOmzet >= 0 ? '+Rp' : '-Rp'}{Math.abs(prevDiffOmzet).toLocaleString('id-ID')} ({prevDiffPct >= 0 ? '+' : ''}{prevDiffPct}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Main Chart Canvas Area with Unified Left Y-Axis */}
                  <div className="flex items-stretch gap-1 sm:gap-2.5 w-full">
                    
                    {/* Unified Left Y-Axis */}
                    <div className="flex flex-col justify-between items-end pb-8 text-[10px] sm:text-[11px] text-gray-400 font-medium select-none flex-shrink-0 w-12 sm:w-16">
                      <span>{formatShortVal(chartMaxY)}</span>
                      <span>{formatShortVal(Math.round(chartMaxY * 0.75))}</span>
                      <span>{formatShortVal(Math.round(chartMaxY * 0.5))}</span>
                      <span>{formatShortVal(Math.round(chartMaxY * 0.25))}</span>
                      <span>Rp0</span>
                    </div>

                    {/* Center Plot Area (SVG Canvas + X-Axis Row) */}
                    <div className="flex-1 min-w-0 relative flex flex-col">
                      <div className="relative w-full h-56 sm:h-64">
                        <svg
                          className="w-full h-full overflow-visible"
                          viewBox="0 0 700 200"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            {/* UntungJelas Brand Emerald Gradient for Laba Area */}
                            <linearGradient id="untungJelasLabaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#009B5B" stopOpacity="0.16" />
                              <stop offset="100%" stopColor="#009B5B" stopOpacity="0.01" />
                            </linearGradient>

                            {/* Subtle Blue Gradient for Omzet Area */}
                            <linearGradient id="untungJelasOmzetGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1E88E5" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#1E88E5" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Dotted Horizontal Grid Lines */}
                          {[16, 57, 98, 139, 180].map((y, idx) => (
                            <line
                              key={idx}
                              x1="0"
                              y1={y}
                              x2="700"
                              y2={y}
                              stroke="#E5E7EB"
                              strokeDasharray="3 4"
                            />
                          ))}

                          {/* Dotted Vertical Guide Lines at each X point (Clean, no origin ray) */}
                          {xCoords.map((x, idx) => (
                            <line
                              key={idx}
                              x1={x}
                              y1="16"
                              x2={x}
                              y2="180"
                              stroke="#F1F5F9"
                              strokeDasharray="3 4"
                            />
                          ))}

                          {/* Active Vertical Cursor Line (Smooth animated position) */}
                          {activeIdx !== null && (
                            <line
                              x1={xCoords[activeIdx]}
                              y1="16"
                              x2={xCoords[activeIdx]}
                              y2="180"
                              stroke="#94A3B8"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                              style={{
                                transition: 'x1 0.25s cubic-bezier(0.16, 1, 0.3, 1), x2 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}
                            />
                          )}

                          {/* Previous Period Comparison Line (Dashed Gray - Smooth SVG Transition) */}
                          {comparePrevious && chartMode === 'line' && (
                            <path
                              d={prevPath}
                              fill="none"
                              stroke="#94A3B8"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              style={{
                                transition: 'd 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
                              }}
                            />
                          )}

                          {/* ================= LINE CHART MODE ================= */}
                          {chartMode === 'line' ? (
                            <>
                              {/* Untung Bersih Gradient Area (Hero Metric) */}
                              {chartSeries.laba && labaArea && (
                                <path
                                  d={labaArea}
                                  fill="url(#untungJelasLabaGrad)"
                                  style={{
                                    transition: 'd 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
                                  }}
                                />
                              )}

                              {/* Omzet Penjualan Curve (Blue #1E88E5) */}
                              {chartSeries.omzet && (
                                <path
                                  d={omzetPath}
                                  fill="none"
                                  stroke="#1E88E5"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{
                                    transition: 'd 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
                                  }}
                                />
                              )}

                              {/* Biaya & HPP Curve (Coral/Red #F43F5E) */}
                              {chartSeries.costs && (
                                <path
                                  d={costPath}
                                  fill="none"
                                  stroke="#F43F5E"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{
                                    transition: 'd 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
                                  }}
                                />
                              )}

                              {/* Untung Bersih Curve (UntungJelas Emerald #009B5B) */}
                              {chartSeries.laba && (
                                <path
                                  d={labaPath}
                                  fill="none"
                                  stroke="#009B5B"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{
                                    transition: 'd 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
                                  }}
                                />
                              )}

                              {/* Interactive Dots & Touch Target on Points */}
                              {trendData.map((d, i) => {
                                const isSelected = activeIdx === i
                                const cVal = d.costs ?? Math.max(0, d.omzet - d.laba)
                                return (
                                  <g
                                    key={i}
                                    className="cursor-pointer"
                                    onClick={() => setActiveChartIndex(i)}
                                    onTouchStart={() => setActiveChartIndex(i)}
                                  >
                                    {/* Invisible Hit Target for mobile tap */}
                                    <circle cx={xCoords[i]} cy={getY(d.omzet)} r="18" fill="transparent" />

                                    {/* Omzet Dot (Blue) */}
                                    {chartSeries.omzet && isSelected && (
                                      <circle
                                        cx={xCoords[i]}
                                        cy={getY(d.omzet)}
                                        r="4.5"
                                        fill="#1E88E5"
                                        stroke="#FFFFFF"
                                        strokeWidth="2.5"
                                        style={{
                                          transition: 'cx 0.25s cubic-bezier(0.16, 1, 0.3, 1), cy 0.25s cubic-bezier(0.16, 1, 0.3, 1), r 0.2s ease'
                                        }}
                                      />
                                    )}

                                    {/* Biaya & HPP Dot (Coral Red) */}
                                    {chartSeries.costs && isSelected && (
                                      <circle
                                        cx={xCoords[i]}
                                        cy={getY(cVal)}
                                        r="4.5"
                                        fill="#F43F5E"
                                        stroke="#FFFFFF"
                                        strokeWidth="2.5"
                                        style={{
                                          transition: 'cx 0.25s cubic-bezier(0.16, 1, 0.3, 1), cy 0.25s cubic-bezier(0.16, 1, 0.3, 1), r 0.2s ease'
                                        }}
                                      />
                                    )}

                                    {/* Untung Bersih Dot (Emerald Green) */}
                                    {chartSeries.laba && isSelected && (
                                      <circle
                                        cx={xCoords[i]}
                                        cy={getY(d.laba)}
                                        r="5"
                                        fill="#009B5B"
                                        stroke="#FFFFFF"
                                        strokeWidth="2.5"
                                        style={{
                                          transition: 'cx 0.25s cubic-bezier(0.16, 1, 0.3, 1), cy 0.25s cubic-bezier(0.16, 1, 0.3, 1), r 0.2s ease'
                                        }}
                                      />
                                    )}
                                  </g>
                                )
                              })}
                            </>
                          ) : (
                            /* ================= BAR CHART MODE ================= */
                            <>
                              {trendData.map((d, i) => {
                                const cVal = d.costs ?? Math.max(0, d.omzet - d.laba)
                                const cx = xCoords[i]
                                const barWidth = 7
                                const gap = 2
                                const isSelected = activeIdx === i

                                return (
                                  <g
                                    key={i}
                                    className="cursor-pointer"
                                    onClick={() => setActiveChartIndex(i)}
                                    onTouchStart={() => setActiveChartIndex(i)}
                                  >
                                    {/* Omzet Bar (Blue) */}
                                    {chartSeries.omzet && (
                                      <rect
                                        x={cx - barWidth * 1.5 - gap}
                                        y={getY(d.omzet)}
                                        width={barWidth}
                                        height={Math.max(2, 180 - getY(d.omzet))}
                                        rx="2.5"
                                        fill="#1E88E5"
                                        opacity={isSelected ? 1 : 0.85}
                                        style={{
                                          transition: 'y 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease'
                                        }}
                                      />
                                    )}

                                    {/* Untung Bersih Bar (Green) */}
                                    {chartSeries.laba && (
                                      <rect
                                        x={cx - barWidth * 0.5}
                                        y={getY(d.laba)}
                                        width={barWidth}
                                        height={Math.max(2, 180 - getY(d.laba))}
                                        rx="2.5"
                                        fill="#009B5B"
                                        opacity={isSelected ? 1 : 0.85}
                                        style={{
                                          transition: 'y 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease'
                                        }}
                                      />
                                    )}

                                    {/* Biaya & HPP Bar (Coral Red) */}
                                    {chartSeries.costs && (
                                      <rect
                                        x={cx + barWidth * 0.5 + gap}
                                        y={getY(cVal)}
                                        width={barWidth}
                                        height={Math.max(2, 180 - getY(cVal))}
                                        rx="2.5"
                                        fill="#F43F5E"
                                        opacity={isSelected ? 1 : 0.85}
                                        style={{
                                          transition: 'y 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease'
                                        }}
                                      />
                                    )}
                                  </g>
                                )
                              })}
                            </>
                          )}
                        </svg>

                        {/* Floating Tooltip Card (UntungJelas Modern Style) */}
                        <div
                          className="hidden sm:block absolute bg-white/98 backdrop-blur-md border border-gray-100 rounded-2xl p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] min-w-[270px] pointer-events-none transition-all duration-200 z-30 select-none"
                          style={{
                            top: '20px',
                            ...(activeIdx < nPoints / 2
                              ? { left: `min(calc(${((xCoords[activeIdx]) / 700) * 100}% + 16px), calc(100% - 290px))` }
                              : { right: `min(calc(${100 - ((xCoords[activeIdx]) / 700) * 100}% + 16px), calc(100% - 290px))` })
                          }}
                        >
                          {/* Tooltip Header: Date & Margin */}
                          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100/90 select-none">
                            <p className="text-xs font-bold text-gray-900 select-none">
                              {activePointDateStr}
                            </p>
                            <div className="text-[11px] font-semibold text-gray-500 select-none">
                              Margin: <span className="font-extrabold text-[#009B5B]">{activePointData.omzet > 0 ? ((activePointData.laba / activePointData.omzet) * 100).toFixed(1) : '0'}%</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            {/* Omzet Penjualan */}
                            {chartSeries.omzet && (
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-gray-600 font-medium whitespace-nowrap">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5] flex-shrink-0" />
                                  <span>Omzet Penjualan</span>
                                </div>
                                <span className="font-bold text-gray-900 whitespace-nowrap">
                                  Rp{activePointData.omzet.toLocaleString('id-ID')}
                                </span>
                              </div>
                            )}

                            {/* Untung Bersih */}
                            {chartSeries.laba && (
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-gray-600 font-medium whitespace-nowrap">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#009B5B] flex-shrink-0" />
                                  <span>Untung Bersih</span>
                                </div>
                                <span className="font-extrabold text-[#009B5B] whitespace-nowrap">
                                  Rp{activePointData.laba.toLocaleString('id-ID')}
                                </span>
                              </div>
                            )}

                            {/* Biaya & HPP */}
                            {chartSeries.costs && (
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-gray-600 font-medium whitespace-nowrap">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] flex-shrink-0" />
                                  <span>Biaya & HPP</span>
                                </div>
                                <span className="font-bold text-gray-900 whitespace-nowrap">
                                  Rp{activePointCosts.toLocaleString('id-ID')}
                                </span>
                              </div>
                            )}

                            {/* Previous Period Real Data Comparison in Tooltip */}
                            {comparePrevious && prevPointData && (
                              <div className="pt-2.5 mt-2.5 border-t border-gray-100/90 space-y-1.5 select-none">
                                <div className="flex items-center justify-between gap-4 text-xs">
                                  <div className="flex items-center gap-2 text-gray-500 font-medium whitespace-nowrap">
                                    <span className="w-2.5 h-2.5 rounded-full border border-gray-300 bg-gray-100 flex-shrink-0" />
                                    <span>Periode Lalu ({prevPointData.day})</span>
                                  </div>
                                  <span className="font-semibold text-gray-700 whitespace-nowrap">
                                    Rp{prevPointData.omzet.toLocaleString('id-ID')}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-4 text-xs">
                                  <div className="flex items-center gap-2 text-gray-500 font-medium whitespace-nowrap">
                                    <span className="w-2.5 h-2.5 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                                      {prevDiffOmzet >= 0 ? '▲' : '▼'}
                                    </span>
                                    <span>Pertumbuhan</span>
                                  </div>
                                  <span className={`font-bold whitespace-nowrap ${prevDiffOmzet >= 0 ? 'text-[#009B5B]' : 'text-rose-500'}`}>
                                    {prevDiffOmzet >= 0 ? '+Rp' : '-Rp'}{Math.abs(prevDiffOmzet).toLocaleString('id-ID')} ({prevDiffPct >= 0 ? '+' : ''}{prevDiffPct}%)
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* X-Axis Labels Row */}
                      <div className="relative w-full h-8 pt-2.5 border-t border-gray-100 select-none">
                        {trendData.map((d, i) => {
                          const total = trendData.length
                          let showOnMobile = true
                          if (total > 14) {
                            showOnMobile = i === 0 || i === Math.floor(total / 2) || i === total - 1
                          } else if (total > 7) {
                            showOnMobile = i % 2 === 0 || i === total - 1
                          }

                          const isFirst = i === 0
                          const isLast = i === total - 1
                          const isActive = activeIdx === i
                          const pct = ((xCoords[i] / 700) * 100).toFixed(2)

                          let positionClass = 'absolute -translate-x-1/2 text-center'
                          let style = { left: `${pct}%` }
                          if (isFirst) {
                            positionClass = 'absolute left-0 text-left'
                            style = {}
                          } else if (isLast) {
                            positionClass = 'absolute right-0 text-right'
                            style = {}
                          }

                          const parts = d.day.split(' ')
                          const dayNum = parts[0]
                          const month = parts[1] || ''

                          return (
                            <div
                              key={i}
                              style={style}
                              className={`${positionClass} cursor-pointer transition-colors ${
                                showOnMobile ? 'block' : 'hidden sm:block'
                              } ${isActive ? 'font-bold text-gray-900' : isLast ? 'font-semibold text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                              onClick={() => setActiveChartIndex(i)}
                            >
                              <div className="sm:hidden flex flex-col items-center text-[10px] leading-tight">
                                {month ? (
                                  isFirst || isLast ? (
                                    <>
                                      <span className={isActive ? 'text-gray-900 font-bold' : ''}>{dayNum}</span>
                                      <span className="text-[8px] font-semibold text-gray-500 uppercase">{month}</span>
                                    </>
                                  ) : (
                                    <span>{dayNum}</span>
                                  )
                                ) : (
                                  <span>{d.day.replace(':00', '')}</span>
                                )}
                              </div>

                              <div className="hidden sm:block text-[11px] whitespace-nowrap">
                                {d.day}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                    </div>

                  </div>

                  {/* ================= BOTTOM LEGEND & TOGGLE SWITCH ROW ================= */}
                  <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 select-none">
                    
                    {/* Left: 3 Checkbox Legend Toggles */}
                    <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
                      
                      {/* Omzet Checkbox Toggle */}
                      <button
                        type="button"
                        onClick={() => setChartSeries((prev) => ({ ...prev, omzet: !prev.omzet }))}
                        className="flex items-center gap-2 cursor-pointer group select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                            chartSeries.omzet
                              ? 'bg-[#1E88E5] text-white shadow-xs'
                              : 'border border-gray-300 bg-white'
                          }`}
                        >
                          {chartSeries.omzet && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-semibold transition-colors ${
                          chartSeries.omzet ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          Omzet Penjualan
                        </span>
                      </button>

                      {/* Untung Bersih Checkbox Toggle */}
                      <button
                        type="button"
                        onClick={() => setChartSeries((prev) => ({ ...prev, laba: !prev.laba }))}
                        className="flex items-center gap-2 cursor-pointer group select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                            chartSeries.laba
                              ? 'bg-[#009B5B] text-white shadow-xs'
                              : 'border border-gray-300 bg-white'
                          }`}
                        >
                          {chartSeries.laba && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-semibold transition-colors ${
                          chartSeries.laba ? 'text-[#009B5B] font-bold' : 'text-gray-400'
                        }`}>
                          Untung Bersih
                        </span>
                      </button>

                      {/* Biaya & HPP Checkbox Toggle */}
                      <button
                        type="button"
                        onClick={() => setChartSeries((prev) => ({ ...prev, costs: !prev.costs }))}
                        className="flex items-center gap-2 cursor-pointer group select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                            chartSeries.costs
                              ? 'bg-[#F43F5E] text-white shadow-xs'
                              : 'border border-gray-300 bg-white'
                          }`}
                        >
                          {chartSeries.costs && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-semibold transition-colors ${
                          chartSeries.costs ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          Biaya & HPP
                        </span>
                      </button>

                    </div>

                    {/* Right: Bandingkan Periode Lalu Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setComparePrevious(!comparePrevious)}
                        className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer select-none"
                      >
                        <div
                          className={`w-9 h-5 rounded-full transition-colors duration-200 relative flex items-center p-0.5 ${
                            comparePrevious ? 'bg-[#009B5B]' : 'bg-gray-200'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                              comparePrevious ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </div>
                        <span className={comparePrevious ? 'text-gray-900 font-semibold' : 'text-gray-500'}>
                          Bandingkan periode lalu
                        </span>
                      </button>
                    </div>

                  </div>

                </div>

                {/* Table: Evaluasi Keuntungan Produk */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="mb-4 sm:mb-5">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900">
                      Evaluasi Keuntungan Produk (Rugi & Tipis)
                    </h2>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                      Pantau produk yang keuntungannya menipis atau merugi akibat kenaikan harga bahan baku.
                    </p>
                  </div>

                  {/* MOBILE VIEW (< sm): Clean Native Cards (Tanpa scrollbar horizontal) */}
                  <div className="space-y-3 sm:hidden">
                    {products.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-4">
                        Belum ada produk. Tambahkan menu dan resep di Katalog & HPP.
                      </div>
                    ) : (
                      products.map((item) => {
                        const margin = item.price - item.hpp
                        const percent = item.marginPercent !== undefined ? item.marginPercent : Math.round((margin / item.price) * 100)
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-100/90 transition-colors"
                        >
                          {/* Header: Icon, Name, Category & Status Badge */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                                {item.icon === 'croissant' ? (
                                  <Croissant className="w-4 h-4 stroke-[1.8]" />
                                ) : (
                                  <Coffee className="w-4 h-4 stroke-[1.8]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate leading-snug">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                  {item.category}
                                </p>
                              </div>
                            </div>

                            {/* Status Badge */}
                            {item.status === 'Rugi' && (
                              <span className="inline-block bg-rose-50 text-rose-600 border border-rose-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">
                                Rugi
                              </span>
                            )}
                            {item.status === 'Tipis' && (
                              <span className="inline-block bg-amber-50 text-amber-600 border border-amber-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">
                                Tipis
                              </span>
                            )}
                            {item.status === 'Sehat' && (
                              <span className="inline-block bg-emerald-50 text-[#009B5B] border border-emerald-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">
                                Sehat
                              </span>
                            )}
                          </div>

                          {/* 3 Metrics: HPP Modal | Harga Jual | Margin Real */}
                          <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-white rounded-xl border border-gray-100 text-center mb-3">
                            <div>
                              <span className="text-[10px] text-gray-400 font-medium block">HPP Modal</span>
                              <span className="text-xs font-bold text-gray-800">
                                Rp{item.hpp.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="border-x border-gray-100 px-1">
                              <span className="text-[10px] text-gray-400 font-medium block">Harga Jual</span>
                              <span className="text-xs font-bold text-gray-800">
                                Rp{item.price.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-medium block">Margin Real</span>
                              <span className={`text-xs font-bold ${margin < 0 ? 'text-rose-500' : item.status === 'Tipis' ? 'text-amber-600' : 'text-[#009B5B]'}`}>
                                {margin < 0 ? `-Rp${Math.abs(margin).toLocaleString('id-ID')}` : `+Rp${margin.toLocaleString('id-ID')}`}
                                <span className="text-[10px] font-medium ml-0.5">({percent}%)</span>
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={() => setShowEditModal(item)}
                            className="w-full py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Edit HPP / Harga Jual</span>
                          </button>
                        </div>
                      )
                    })
                  )}
                  </div>

                  {/* DESKTOP VIEW (>= sm): Full elegant table without ugly blue pills */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-3 px-2 font-semibold text-xs text-gray-400">
                            Nama Produk
                          </th>
                          <th className="py-3 px-2 font-semibold text-xs text-gray-400">
                            HPP Modal
                          </th>
                          <th className="py-3 px-2 font-semibold text-xs text-gray-400">
                            Harga Jual
                          </th>
                          <th className="py-3 px-2 font-semibold text-xs text-gray-400">
                            Margin Real
                          </th>
                          <th className="py-3 px-2 font-semibold text-xs text-gray-400">
                            Status
                          </th>
                          <th className="py-3 px-2 font-semibold text-xs text-gray-400 text-center">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                              Belum ada produk. Tambahkan menu dan resep di Katalog & HPP.
                            </td>
                          </tr>
                        ) : (
                          products.map((item) => {
                            const margin = item.price - item.hpp
                            const percent = item.marginPercent !== undefined ? item.marginPercent : Math.round((margin / item.price) * 100)
                          return (
                            <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="py-3.5 px-2">
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

                              <td className="py-3.5 px-2 text-xs font-semibold text-gray-800">
                                Rp{item.hpp.toLocaleString('id-ID')}
                              </td>

                              <td className="py-3.5 px-2 text-xs font-medium text-gray-700">
                                Rp{item.price.toLocaleString('id-ID')}
                              </td>

                              <td className="py-3.5 px-2 text-xs font-bold">
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

                              <td className="py-3.5 px-2">
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

                              <td className="py-3.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setShowEditModal(item)}
                                  className="text-[11px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 shadow-xs transition-all cursor-pointer"
                                >
                                  Edit HPP / Harga
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* ================= RIGHT 4 COLS: AI INSIGHTS & CASH DRAWER ================= */}
              <div className="xl:col-span-4 space-y-5">
                
                {/* ================= AI ASSISTANT WIDGET (SMOOTH DROPDOWN ACCORDION) ================= */}
                <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-[0_4px_20px_rgba(0,155,91,0.04)] overflow-hidden flex flex-col transition-all duration-300">
                  
                  {/* Top ambient soft green gradient header (clickable to toggle) */}
                  <div
                    onClick={() => setIsAiPanelMinimized(!isAiPanelMinimized)}
                    className="bg-gradient-to-b from-emerald-50/70 via-emerald-50/20 to-white pt-4 pb-2.5 px-4 relative cursor-pointer select-none transition-colors hover:from-emerald-50/90"
                  >
                    {/* V (Dropdown Chevron) Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsAiPanelMinimized(!isAiPanelMinimized)
                      }}
                      className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-white/80 transition-all cursor-pointer flex items-center justify-center"
                      title={isAiPanelMinimized ? 'Buka AI Assistant' : 'Tutup AI Assistant'}
                      aria-label="Toggle AI Assistant"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-300 ease-in-out ${
                          isAiPanelMinimized ? 'rotate-0' : 'rotate-180'
                        }`}
                      />
                    </button>

                    {/* UntungJelas Brand Logo (Tanpa teks, logo icon saja) */}
                    <div className="w-10 h-10 mx-auto bg-white rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-center p-2 mb-1.5 transition-transform duration-300">
                      <img
                        src="/assets/Icons/logo.png"
                        alt="UntungJelas Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Header Title & Subtitle */}
                    <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 text-center tracking-tight">
                      AI Assistant
                    </h3>
                    <p className="text-[11px] text-gray-500 text-center mt-0.5 transition-all">
                      {isAiPanelMinimized
                        ? 'Klik untuk melihat rekomendasi & analisis'
                        : "Here's what needs your attention today:"}
                    </p>
                  </div>

                  {/* Smooth Animated Collapsible Content */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                      isAiPanelMinimized
                        ? 'grid-rows-[0fr] opacity-0 pointer-events-none'
                        : 'grid-rows-[1fr] opacity-100 pointer-events-auto'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-3.5 pt-1 space-y-2.5">
                        
                        {/* Real Insight Card */}
                        <div className="bg-white rounded-2xl p-3 border border-emerald-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2">
                          {statsLoading ? (
                            <div className="py-4 text-center space-y-2">
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-[#009B5B] animate-spin">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <p className="text-xs font-semibold text-gray-700 animate-pulse">
                                Lagi dianalisis...
                              </p>
                              <p className="text-[10px] text-gray-400">
                                Menganalisis transaksi & margin dengan AI UntungJelas
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#009B5B] bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>{insightData.source === 'fallback' ? 'Smart Insight' : 'AI Gemini'}</span>
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {insightData.source === 'fallback' ? 'Berbasis Aturan' : 'Analisis AI'}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-gray-900 leading-snug">
                                {insightData.headline}
                              </h4>

                              <p className="text-[11px] text-gray-600 leading-relaxed">
                                {insightData.text}
                              </p>

                              <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                                <span>Saran harian kasir & HPP</span>
                                <span className="text-[#009B5B] font-semibold">UntungJelas Engine</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Quick action button to check product margins */}
                        <button
                          type="button"
                          onClick={() => setActiveMenu('Katalog & HPP')}
                          className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-[#009B5B] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>Kelola Resep & Margin Menu</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </div>
                  </div>

                </div>

                {/* Card: Status Laci Kasir */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E88E5]">
                      <Store className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-[13px] font-bold text-gray-900">
                          Status Laci Kasir
                        </h4>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          Aktif
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                        Modal Awal: <span className="font-semibold text-gray-600">Rp200.000</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm sm:text-base font-extrabold text-[#009B5B]">
                      Rp{(200000 + (Number(dashboardStats?.today?.cash_in) || 0)).toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      Kas Masuk: Rp{(Number(dashboardStats?.today?.cash_in) || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Card: Transaksi Kasir Terbaru */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#009B5B] flex items-center justify-center">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-[13px] font-bold text-gray-900">
                          Transaksi Kasir Terbaru
                        </h4>
                        <p className="text-[10px] text-gray-400">
                          {recentTransactions.length > 0
                            ? `${recentTransactions.length} transaksi terakhir dicatat`
                            : 'Belum ada transaksi tercatat'}
                        </p>
                      </div>
                    </div>
                    {recentTransactions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveMenu('Laporan Keuangan')}
                        className="text-[11px] font-bold text-[#009B5B] hover:text-[#00874e] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {recentTransactions.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {recentTransactions.map((trx) => {
                        const shortId = trx.uuid ? `#TX-${trx.uuid.substring(0, 8).toUpperCase()}` : `#TX-${trx.id}`
                        const timeStr = trx.paid_at
                          ? new Date(trx.paid_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                          : trx.time || 'Baru saja'
                        const itemsSummary = Array.isArray(trx.items) && trx.items.length > 0
                          ? `${trx.items[0].qty}x ${trx.items[0].product_name || trx.items[0].name || 'Menu'}${trx.items.length > 1 ? ` +${trx.items.length - 1}` : ''}`
                          : `${trx.items_count || 1} Item`
                        const profit = Number(trx.profit ?? trx.total_profit) || 0
                        const omzet = Number(trx.total) || 0

                        return (
                          <div
                            key={trx.id || trx.uuid}
                            className="p-2.5 rounded-xl bg-gray-50/70 hover:bg-emerald-50/40 border border-gray-100 transition-colors flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-gray-900">{shortId}</span>
                                <span className="text-[10px] text-gray-400">• {timeStr}</span>
                                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-white text-gray-600 border border-gray-200">
                                  {trx.payment_method || 'Tunai'}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 truncate">{itemsSummary}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right">
                                <p className="font-bold text-gray-900">Rp{omzet.toLocaleString('id-ID')}</p>
                                <p className="text-[10px] font-semibold text-[#009B5B]">
                                  +Rp{profit.toLocaleString('id-ID')}
                                </p>
                              </div>
                              {trx.uuid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const url = `/#struk/${trx.uuid}`
                                    const win = window.open(url, '_blank')
                                    if (!win || win.closed || typeof win.closed === 'undefined') {
                                      window.location.hash = `struk/${trx.uuid}`
                                    }
                                  }}
                                  title="Buka Struk Digital"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#009F58] hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 stroke-[1.8]" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center rounded-xl bg-gray-50/50 border border-dashed border-gray-200">
                      <p className="text-xs font-semibold text-gray-600">Belum ada transaksi</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Lakukan penjualan di kasir untuk melihat aktivitas di sini.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('Kasir')}
                        className="mt-3 px-3 py-1.5 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Buka Kasir Sekarang</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </>
        )}

      </div>

      {/* ================= MODAL: EDIT HPP / HARGA ================= */}
      {showEditModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm m-0">
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
        </div>,
        document.body
      )}

    </div>
  )
}
