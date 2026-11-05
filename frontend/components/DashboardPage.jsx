import React, { useState, useEffect, useRef } from 'react'
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
  MoreVertical
} from 'lucide-react'

// Daily cafe performance records for September, October & November 2026
const DAILY_RECORDS = {
  // September 2026 (for prior month comparison)
  '2026-09-15': { omzet: 410000, laba: 160000, transaksi: 15 },
  '2026-09-16': { omzet: 430000, laba: 170000, transaksi: 16 },
  '2026-09-17': { omzet: 450000, laba: 180000, transaksi: 17 },
  '2026-09-18': { omzet: 490000, laba: 195000, transaksi: 19 },
  '2026-09-19': { omzet: 550000, laba: 225000, transaksi: 22 },
  '2026-09-20': { omzet: 580000, laba: 240000, transaksi: 23 },
  '2026-09-21': { omzet: 390000, laba: 150000, transaksi: 15 },
  '2026-09-22': { omzet: 420000, laba: 165000, transaksi: 16 },
  '2026-09-23': { omzet: 440000, laba: 175000, transaksi: 17 },
  '2026-09-24': { omzet: 470000, laba: 190000, transaksi: 18 },
  '2026-09-25': { omzet: 510000, laba: 205000, transaksi: 20 },
  '2026-09-26': { omzet: 560000, laba: 230000, transaksi: 22 },
  '2026-09-27': { omzet: 600000, laba: 250000, transaksi: 24 },
  '2026-09-28': { omzet: 410000, laba: 160000, transaksi: 16 },
  '2026-09-29': { omzet: 430000, laba: 170000, transaksi: 17 },
  '2026-09-30': { omzet: 460000, laba: 185000, transaksi: 18 },
  // October 2026
  '2026-10-01': { omzet: 420000, laba: 170000, transaksi: 16 },
  '2026-10-02': { omzet: 460000, laba: 185000, transaksi: 18 },
  '2026-10-03': { omzet: 510000, laba: 210000, transaksi: 20 },
  '2026-10-04': { omzet: 530000, laba: 215000, transaksi: 21 },
  '2026-10-05': { omzet: 390000, laba: 150000, transaksi: 15 },
  '2026-10-06': { omzet: 410000, laba: 160000, transaksi: 16 },
  '2026-10-07': { omzet: 440000, laba: 175000, transaksi: 17 },
  '2026-10-08': { omzet: 480000, laba: 195000, transaksi: 19 },
  '2026-10-09': { omzet: 520000, laba: 210000, transaksi: 20 },
  '2026-10-10': { omzet: 560000, laba: 230000, transaksi: 22 },
  '2026-10-11': { omzet: 590000, laba: 245000, transaksi: 23 },
  '2026-10-12': { omzet: 430000, laba: 165000, transaksi: 16 },
  '2026-10-13': { omzet: 450000, laba: 175000, transaksi: 17 },
  '2026-10-14': { omzet: 470000, laba: 185000, transaksi: 18 },
  '2026-10-15': { omzet: 500000, laba: 200000, transaksi: 19 },
  '2026-10-16': { omzet: 540000, laba: 220000, transaksi: 21 },
  '2026-10-17': { omzet: 610000, laba: 250000, transaksi: 24 },
  '2026-10-18': { omzet: 630000, laba: 260000, transaksi: 25 },
  '2026-10-19': { omzet: 440000, laba: 170000, transaksi: 17 },
  '2026-10-20': { omzet: 460000, laba: 180000, transaksi: 18 },
  '2026-10-21': { omzet: 480000, laba: 190000, transaksi: 19 },
  '2026-10-22': { omzet: 510000, laba: 205000, transaksi: 20 },
  '2026-10-23': { omzet: 530000, laba: 215000, transaksi: 21 },
  '2026-10-24': { omzet: 570000, laba: 230000, transaksi: 22 },
  '2026-10-25': { omzet: 450000, laba: 175000, transaksi: 18 },
  '2026-10-26': { omzet: 410000, laba: 155000, transaksi: 15 },
  '2026-10-27': { omzet: 520000, laba: 220000, transaksi: 22 },
  '2026-10-28': { omzet: 440000, laba: 180000, transaksi: 17 },
  '2026-10-29': { omzet: 490000, laba: 200000, transaksi: 19 },
  '2026-10-30': { omzet: 460000, laba: 190000, transaksi: 18 },
  '2026-10-31': { omzet: 580000, laba: 220000, transaksi: 21 },
  // November 2026 (1 Nov is today)
  '2026-11-01': { omzet: 650000, laba: 250000, transaksi: 24 }
}

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

// ================= ROLLING ODOMETER / DIGIT REEL TICKER =================
// 20 items: 0..9 then 0..9 for seamless vertical reel spinning
const DIGIT_REEL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function SingleDigitReel({ digit, delay = 0 }) {
  const [target, setTarget] = useState(0)

  useEffect(() => {
    // Delay rolling so on initial page mount it starts at 0 and rolls up to 10 + digit
    const timer = setTimeout(() => {
      setTarget(10 + digit)
    }, 40 + delay)
    return () => clearTimeout(timer)
  }, [digit, delay])

  return (
    <span
      className="inline-block relative overflow-hidden text-center select-none"
      style={{
        height: '1.45em',
        width: '0.65em',
        verticalAlign: 'middle'
      }}
    >
      <span
        className="block will-change-transform"
        style={{
          transform: `translateY(-${target * 5}%)`,
          transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {DIGIT_REEL.map((num, i) => (
          <span
            key={i}
            className="flex items-center justify-center font-black"
            style={{ height: '1.45em', lineHeight: 1 }}
          >
            {num}
          </span>
        ))}
      </span>
    </span>
  )
}

function RollNumberTicker({ value, prefix = '', suffix = '', formatLocale = true, className = '' }) {
  let numStr = ''
  if (typeof value === 'number') {
    numStr = formatLocale ? Math.abs(value).toLocaleString('id-ID') : String(Math.abs(value))
  } else {
    const match = String(value).match(/\d+/)
    if (match) {
      const n = parseInt(match[0], 10)
      numStr = formatLocale ? n.toLocaleString('id-ID') : String(n)
    } else {
      numStr = String(value)
    }
  }

  const isNeg = typeof value === 'number' && value < 0
  const finalPrefix = isNeg ? `-${prefix}` : prefix

  const chars = numStr.split('')
  let digitCount = 0

  return (
    <span className={`inline-flex items-center tracking-tight ${className}`}>
      {finalPrefix && (
        <span
          className="select-none font-black mr-0.5 inline-flex items-center justify-center"
          style={{ height: '1.45em' }}
        >
          {finalPrefix}
        </span>
      )}
      {chars.map((char, idx) => {
        const isDigit = /\d/.test(char)
        if (isDigit) {
          const digit = parseInt(char, 10)
          const delay = digitCount * 45
          digitCount++
          const keyFromRight = `d-${chars.length - 1 - idx}`
          return (
            <SingleDigitReel
              key={keyFromRight}
              digit={digit}
              delay={delay}
            />
          )
        }
        return (
          <span
            key={`sep-${idx}`}
            className="select-none font-black px-[1px] inline-flex items-center justify-center text-center"
            style={{ height: '1.45em', width: '0.28em' }}
          >
            {char}
          </span>
        )
      })}
      {suffix && (
        <span
          className="select-none font-black ml-1.5 inline-flex items-center justify-center"
          style={{ height: '1.45em' }}
        >
          {suffix}
        </span>
      )}
    </span>
  )
}

export default function DashboardPage({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [chartSeries, setChartSeries] = useState({ omzet: true, laba: true, costs: true })
  const [comparePrevious, setComparePrevious] = useState(false)
  const [chartMode, setChartMode] = useState('line') // 'line' or 'bar'
  const [activeChartIndex, setActiveChartIndex] = useState(null)
  
  // ================= TOP BAR STATES =================
  // 1. Date Filter & Interactive Calendar States
  const [selectedDateFilter, setSelectedDateFilter] = useState('Hari ini, 1 Nov 2026')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [calMonth, setCalMonth] = useState({ year: 2026, month: 10 }) // 10 is November (current today date)
  const [selectedStartDate, setSelectedStartDate] = useState('2026-11-01')
  const [selectedEndDate, setSelectedEndDate] = useState('2026-11-01')
  const [tempStart, setTempStart] = useState('2026-11-01')
  const [tempEnd, setTempEnd] = useState('2026-11-01')
  const [chartTitle, setChartTitle] = useState('Performa Jam Operasional Hari Ini (08:00 - 20:00)')
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
  const [shiftInfo, setShiftInfo] = useState({ active: 'Pagi', time: '08:00 - 16:00', kasir: 'Nabila (Owner)' })

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
  const [kpiStats, setKpiStats] = useState({
    untung: 250000,
    untungGrowth: '12% dari kemarin',
    omzet: 650000,
    omzetGrowth: '+8% rata-rata harian',
    transaksi: 24,
    transaksiSub: 'Rata-rata Rp27.083/struk',
    kesehatan: 82,
    kesehatanLabel: 'Sehat'
  })

  // ================= REAL-TIME TREND CHART STATE =================
  // 7 Days dataset (25 Okt - 01 Nov)
  const [trendData, setTrendData] = useState([
    { day: '25 Okt', omzet: 450000, laba: 175000 },
    { day: '26 Okt', omzet: 410000, laba: 155000 },
    { day: '27 Okt', omzet: 520000, laba: 220000 },
    { day: '28 Okt', omzet: 440000, laba: 180000 },
    { day: '29 Okt', omzet: 490000, laba: 200000 },
    { day: '30 Okt', omzet: 460000, laba: 190000 },
    { day: '01 Nov', omzet: 650000, laba: 250000 }
  ])

  // Corresponding actual historical previous 7 days dataset (18 Okt - 24 Okt)
  const [prevTrendData, setPrevTrendData] = useState([
    { day: '18 Okt', omzet: 630000, laba: 260000 },
    { day: '19 Okt', omzet: 440000, laba: 170000 },
    { day: '20 Okt', omzet: 460000, laba: 180000 },
    { day: '21 Okt', omzet: 480000, laba: 190000 },
    { day: '22 Okt', omzet: 510000, laba: 205000 },
    { day: '23 Okt', omzet: 530000, laba: 215000 },
    { day: '24 Okt', omzet: 570000, laba: 230000 }
  ])

  // Universal Real-time update function: immediately moves Chart lines up or down
  const updateRealtimeData = (deltaOmzet, deltaLaba, label = '') => {
    setTrendData((prev) => {
      const updated = [...prev]
      const lastIndex = updated.length - 1
      const current = updated[lastIndex]
      const newOmzet = Math.max(0, current.omzet + deltaOmzet)
      const newLaba = Math.max(0, current.laba + deltaLaba)
      updated[lastIndex] = { ...current, omzet: newOmzet, laba: newLaba }
      return updated
    })

    setKpiStats((prev) => ({
      ...prev,
      omzet: Math.max(0, prev.omzet + deltaOmzet),
      untung: Math.max(0, prev.untung + deltaLaba),
      transaksi: deltaOmzet > 0 ? `${parseInt(prev.transaksi) + 1} Struk` : prev.transaksi
    }))

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
      type: 'warning',
      title: 'Peringatan Stok Gula Aren',
      message: 'Stok Gula Aren tinggal 100ml (~5 cup). Harap segera belanja stok suplai!',
      time: '10 menit lalu',
      read: false
    },
    {
      id: 2,
      type: 'danger',
      title: 'Kenaikan Harga Bahan Baku',
      message: 'Harga Mentega naik 15%, membuat Croissant Cokelat saat ini rugi Rp500/biji.',
      time: '1 jam lalu',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Laporan Keuangan Siap',
      message: 'Laporan laba rugi & HPP bulan Oktober 2026 sudah selesai dan siap diunduh.',
      time: '3 jam lalu',
      read: false
    }
  ])

  // Search Autocomplete Database
  const searchDatabase = [
    { type: 'Produk', title: 'Croissant Cokelat', desc: 'Pastry • Fresh Bake • Rp10.000' },
    { type: 'Produk', title: 'Es Kopi Milkshake', desc: 'Beverage • Cold Drink • Rp13.000' },
    { type: 'Produk', title: 'Kopi Susu Gula Aren', desc: 'Beverage • Best Seller • Rp15.000' },
    { type: 'Produk', title: 'Matcha Green Tea Latte', desc: 'Beverage • Hot/Cold • Rp18.000' },
    { type: 'Transaksi', title: '#TRX-20261101-024', desc: 'Rp28.000 • 13:45 • Tunai (Lunas)' },
    { type: 'Transaksi', title: '#TRX-20261101-023', desc: 'Rp45.000 • 13:20 • QRIS ShopeePay' },
    { type: 'Transaksi', title: '#TRX-20261101-022', desc: 'Rp13.000 • 12:50 • BCA Debit' },
    { type: 'Resep & Bahan', title: 'Resep Biji Kopi Arabika', desc: 'HPP Rp2.800/shot • Stok 4.2 kg' },
    { type: 'Resep & Bahan', title: 'Sirup Gula Aren Asli', desc: 'HPP Rp1.500/porsi • Sisa 100ml (Kritis)' },
    { type: 'Resep & Bahan', title: 'Mentega Wijsman / Anchor', desc: 'Bahan Pastry • Kenaikan harga +15%' },
  ]

  const filteredSearchResults = searchDatabase.filter((item) => {
    if (!searchQuery.trim()) return true
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Product evaluation list
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

  // ================= KASIR (POS) STATE =================
  const [posCart, setPosCart] = useState([
    { id: 1, name: 'Croissant Cokelat', price: 10000, qty: 1 },
    { id: 2, name: 'Es Kopi Milkshake', price: 13000, qty: 1 }
  ])

  const posCatalog = [
    { id: 1, name: 'Croissant Cokelat', price: 10000, category: 'Pastry', icon: 'croissant' },
    { id: 2, name: 'Es Kopi Milkshake', price: 13000, category: 'Minuman', icon: 'coffee' },
    { id: 3, name: 'Kopi Susu Aren', price: 15000, category: 'Minuman', icon: 'coffee' },
    { id: 4, name: 'Matcha Latte', price: 18000, category: 'Minuman', icon: 'coffee' },
    { id: 5, name: 'Roti Bakar Srikaya', price: 12000, category: 'Makanan', icon: 'croissant' },
    { id: 6, name: 'Kentang Goreng Keju', price: 14000, category: 'Snack', icon: 'croissant' },
  ]

  const [posCategory, setPosCategory] = useState('Semua')

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
      const dData = DAILY_RECORDS[start] || { omzet: 450000, laba: 180000, transaksi: 18 }
      const isToday = start === '2026-11-01'
      const label = isToday ? 'Hari ini, 1 Nov 2026' : `${formatDayMonth(start)} 2026`
      
      setSelectedDateFilter(label)
      setChartTitle(isToday ? 'Performa Jam Operasional Hari Ini (08:00 - 20:00)' : `Performa Jam Sibuk & Arus Kas (${label})`)
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

      setKpiStats({
        untung: dData.laba,
        untungGrowth: isToday ? '12% dari kemarin' : `${formatDayMonth(prevDateStr)}: Rp${prevData.laba.toLocaleString('id-ID')}`,
        omzet: dData.omzet,
        omzetGrowth: isToday ? '+8% rata-rata harian' : `Total 1 Hari (${formatDayMonth(start)})`,
        transaksi: dData.transaksi,
        transaksiSub: `Rata-rata Rp${Math.round(dData.omzet / dData.transaksi).toLocaleString('id-ID')}/struk`,
        kesehatan: 82,
        kesehatanLabel: 'Sehat'
      })
      showToast(isToday ? 'Menampilkan data real-time Hari Ini (1 Nov 2026)' : `Data dashboard disesuaikan: ${label}`)
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
        const d = DAILY_RECORDS[dateStr] || { omzet: 450000, laba: 180000, transaksi: 18 }
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
        const d = DAILY_RECORDS[dateStr] || { omzet: 420000, laba: 170000, transaksi: 16 }
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

  const handleAskAi = (e, customQuery = null) => {
    if (e && e.preventDefault) e.preventDefault()
    const query = (customQuery || aiQuestion).trim()
    if (!query) return

    setAiQuestion('')
    showToast(`AI sedang menganalisis: "${query}"...`)

    setTimeout(() => {
      const lower = query.toLowerCase()
      if (lower.includes('harga') || lower.includes('margin') || lower.includes('evaluasi') || lower.includes('produk')) {
        showToast('💡 Rekomendasi AI: Sesuaikan Croissant Cokelat ke Rp13.000 untuk amankan margin untung 23%.')
      } else if (lower.includes('stok') || lower.includes('gula') || lower.includes('habis')) {
        showToast('📦 Stok Sirup Gula Aren tersisa 5 cup. Segera pesan ke supplier!')
      } else if (lower.includes('laci') || lower.includes('kas') || lower.includes('kasir')) {
        showToast('💰 Kas di tangan tercatat Rp850.000 (Modal awal Rp200.000 + Penjualan Rp650.000). Kas fisik seimbang!')
      } else {
        showToast('✨ Saran AI: Bundle "Kopi Susu + Croissant" seharga Rp23.000 berpotensi genjot margin +28%!')
      }
    }, 900)
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

  // POS Cart Calculations
  const cartSubtotal = posCart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartTax = Math.round(cartSubtotal * 0.1)
  const cartTotal = cartSubtotal + cartTax

  const handleAddToCart = (product) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }]
    })
    showToast(`${product.name} ditambahkan ke struk!`)
  }

  const handleUpdateQty = (id, delta) => {
    setPosCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    )
  }

  const handleCompletePayment = (method) => {
    if (posCart.length === 0) return
    const totalTrx = cartTotal
    const profitEst = Math.round(totalTrx * 0.38)
    setPosCart([])
    updateRealtimeData(totalTrx, profitEst, `Kasir: ${method}`)
    showToast(`Transaksi berhasil via ${method}! Struk tercetak.`)
    setActiveMenu('Dashboard')
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
  const activePointData = trendData[activeIdx] || { day: '01 Nov', omzet: 650000, laba: 250000 }
  const activePointCosts = activePointData.costs ?? Math.max(0, activePointData.omzet - activePointData.laba)
  const prevPointData = prevTrendData[activeIdx] || { day: 'Lalu', omzet: Math.round(activePointData.omzet * 0.9), laba: Math.round(activePointData.laba * 0.9) }
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
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Notifikasi Toko</h4>
                      <p className="text-[10px] text-gray-400">{unreadCount} pesan belum dibaca</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotifications}
                        className="text-[11px] font-semibold text-[#009B5B] hover:underline cursor-pointer"
                      >
                        Tandai dibaca
                      </button>
                    )}
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
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 leading-snug">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
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
              )}
            </div>

            {/* ================= 3. USER PROFILE DROPDOWN ================= */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 sm:gap-2.5 py-1 hover:opacity-90 transition-opacity cursor-pointer text-left select-none"
              >
                <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                    alt="Kedai Kopi Nabila"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-gray-900 tracking-tight hidden min-[400px]:inline-block">
                  Kedai Kopi Nabila
                </span>
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in">
                  {/* User Profile Card Header */}
                  <div className="px-3 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900">Nabila Putri</p>
                    <p className="text-[11px] text-gray-500">nabila@kedaikopi.id</p>
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
              )}
            </div>

          </div>
        </header>

        {/* ================= IF ACTIVE MENU IS KASIR (POS) ================= */}
        {activeMenu === 'Kasir' ? (
          <div className="space-y-5 animate-fade-in">
            {/* POS Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div>
                <button
                  type="button"
                  onClick={() => setActiveMenu('Dashboard')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#009B5B] hover:underline mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Dashboard</span>
                </button>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Kasir POS (Point of Sale)
                </h1>
                <p className="text-xs text-gray-500">
                  Layani transaksi pelanggan cepat dan otomatis catat laba bersih.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                  Laci Kasir: <strong>Rp850.000</strong>
                </span>
              </div>
            </div>

            {/* POS Grid: Catalog Left (8 cols) & Cart Right (4 cols) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              
              {/* Product Catalog (8 cols) */}
              <div className="xl:col-span-8 space-y-4">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['Semua', 'Minuman', 'Pastry', 'Makanan', 'Snack'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPosCategory(cat)}
                      className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        posCategory === cat
                          ? 'bg-[#009B5B] text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Product Grid Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {posCatalog
                    .filter((p) => posCategory === 'Semua' || p.category === posCategory)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleAddToCart(item)}
                        className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-[#009B5B] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-[#009B5B] mb-3 group-hover:scale-110 transition-transform">
                          {item.icon === 'croissant' ? (
                            <Croissant className="w-5 h-5 stroke-[1.8]" />
                          ) : (
                            <Coffee className="w-5 h-5 stroke-[1.8]" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 group-hover:text-[#009B5B] transition-colors leading-snug">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                            {item.category}
                          </span>
                          <p className="text-xs font-extrabold text-gray-800 mt-2">
                            Rp{item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-3 w-full py-1.5 bg-gray-50 hover:bg-[#009B5B] hover:text-white text-gray-700 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>Tambah</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Struk / Cart Right (4 cols) */}
              <div className="xl:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-gray-600" />
                    <h3 className="text-xs font-bold text-gray-900">Struk Transaksi Baru</h3>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {posCart.length} Menu
                  </span>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto my-2">
                  {posCart.length > 0 ? (
                    posCart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-gray-800 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            @Rp{item.price.toLocaleString('id-ID')}
                          </p>
                        </div>

                        {/* Qty +/- */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-gray-900 w-4 text-center">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-[#009B5B] flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-gray-900 ml-3 min-w-[60px] text-right">
                          Rp{(item.price * item.qty).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-xs text-gray-400">
                      Struk masih kosong. Klik menu di katalog untuk menambahkan pesanan.
                    </div>
                  )}
                </div>

                {/* Calculation Summary */}
                <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">Rp{cartSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak Resto (10%)</span>
                    <span className="font-semibold text-gray-800">Rp{cartTax.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total Bayar</span>
                    <span className="text-[#009B5B]">Rp{cartTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Payment Action Buttons */}
                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    disabled={posCart.length === 0}
                    onClick={() => handleCompletePayment('Tunai (Cash)')}
                    className="w-full py-2.5 bg-[#009B5B] hover:bg-[#00874e] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Bayar Tunai (Cash)
                  </button>

                  <button
                    type="button"
                    disabled={posCart.length === 0}
                    onClick={() => handleCompletePayment('QRIS / E-Wallet')}
                    className="w-full py-2.5 bg-[#1E88E5] hover:bg-[#1976D2] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Bayar QRIS / Transfer
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ================= MAIN DASHBOARD CONTENT ================= */
          <>
            {/* Greeting & Date / Quick Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 tracking-tight">
                  Halo, Nabila!
                </h1>
                <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5">
                  Berikut ringkasan performa finansial usahamu hari ini.
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
                                applyDateSelection('2026-11-01', '2026-11-01')
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
                              applyDateSelection('2026-11-01', '2026-11-01')
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                              selectedStartDate === '2026-11-01' && selectedEndDate === '2026-11-01'
                                ? 'bg-emerald-50 text-[#009B5B] font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Hari Ini
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              applyDateSelection('2026-10-31', '2026-10-31')
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                              selectedStartDate === '2026-10-31' && selectedEndDate === '2026-10-31'
                                ? 'bg-emerald-50 text-[#009B5B] font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Kemarin
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              applyDateSelection('2026-10-26', '2026-11-01')
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                              selectedStartDate === '2026-10-26' && selectedEndDate === '2026-11-01'
                                ? 'bg-emerald-50 text-[#009B5B] font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            7 Hari Terakhir
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              applyDateSelection('2026-10-01', '2026-10-31')
                            }}
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                              selectedStartDate === '2026-10-01' && selectedEndDate === '2026-10-31'
                                ? 'bg-emerald-50 text-[#009B5B] font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Bulan Lalu (Okt)
                          </button>
                        </div>

                        {/* Month Navigation */}
                        <div className="flex items-center justify-between px-1 py-1.5 mb-1 bg-gray-50/80 rounded-xl">
                          <button
                            type="button"
                            onClick={() => {
                              if (calMonth.month === 9) {
                                setCalMonth({ year: 2026, month: 8 })
                              } else if (calMonth.month === 10) {
                                setCalMonth({ year: 2026, month: 9 })
                              }
                            }}
                            disabled={calMonth.month <= 8}
                            className="p-1 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold text-gray-800">
                            {MONTH_NAMES_ID[calMonth.month]} {calMonth.year}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (calMonth.month === 8) {
                                setCalMonth({ year: 2026, month: 9 })
                              } else if (calMonth.month === 9) {
                                setCalMonth({ year: 2026, month: 10 })
                              }
                            }}
                            disabled={calMonth.month >= 10}
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
                            const isToday = dStr === '2026-11-01'
                            const isFuture = dStr > '2026-11-01'
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
                                <strong className="text-gray-900">{formatDayMonth(tempStart)} - {formatDayMonth(tempEnd)} 2026</strong>
                                <span className="text-[10px] text-gray-400 ml-1">({countDays(tempStart, tempEnd)} hari)</span>
                              </span>
                            ) : tempStart ? (
                              <span className="truncate block">
                                <strong className="text-gray-900">{tempStart === '2026-11-01' ? 'Hari ini, 1 Nov 2026' : `${formatDayMonth(tempStart)} 2026`}</strong>
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
                    <RollNumberTicker value={kpiStats.untung} prefix="Rp" />
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-100 font-medium">
                  <span className="inline-block">▲</span>
                  <span>{kpiStats.untungGrowth}</span>
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
                    <RollNumberTicker value={kpiStats.omzet} prefix="Rp" />
                  </h3>
                </div>
                <div className="text-[11px] text-[#009B5B] font-semibold">
                  {kpiStats.omzetGrowth}
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
                    {kpiStats.transaksi} Struk
                  </h3>
                </div>
                <div className="text-[11px] text-gray-400 font-medium">
                  {kpiStats.transaksiSub}
                </div>
              </div>

              {/* Card 4: Kesehatan Usaha */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-1">
                    Kesehatan Usaha
                  </span>
                  <div className="flex items-baseline text-2xl sm:text-[26px] font-black text-gray-900 tracking-tight my-1">
                    <span>{kpiStats.kesehatan}</span>
                    <span className="text-xs font-medium text-gray-400 ml-0.5">/100</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center bg-[#009B5B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {kpiStats.kesehatanLabel}
                    </span>
                  </div>
                </div>

                {/* Semi-Circle Speedometer Gauge with Animated Needle & Arc */}
                {(() => {
                  const score = Math.min(100, Math.max(0, kpiStats.kesehatan || 80))
                  const angleDeg = 180 - (score / 100) * 180
                  const angleRad = (angleDeg * Math.PI) / 180
                  const nx = (50 + 26 * Math.cos(angleRad)).toFixed(1)
                  const ny = (50 - 26 * Math.sin(angleRad)).toFixed(1)
                  const arcLength = 125.6
                  const arcOffset = (arcLength * (1 - score / 100)).toFixed(1)
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
                          stroke="#009B5B"
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
                    {products.map((item) => {
                      const margin = item.price - item.hpp
                      const percent = Math.round((margin / item.price) * 100)
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
                    })}
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
                        {products.map((item) => {
                          const margin = item.price - item.hpp
                          const percent = Math.round((margin / item.price) * 100)
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
                        })}
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
                      <div className="p-3.5 pt-1 space-y-2">
                        
                        {/* Card 1: Margin Alert */}
                        <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:border-emerald-100 transition-all space-y-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs font-bold text-gray-900 leading-snug">
                              Harga Mentega naik 15%, Croissant rugi.
                            </h4>
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded flex-shrink-0">
                              Rugi
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-tight">
                            Naikkan harga jual ke Rp13.000 agar margin aman di 23%.
                          </p>
                          <button
                            type="button"
                            onClick={handleAdjustCroissantPrice}
                            className="pt-1 flex items-center gap-1 text-[11px] font-bold text-[#009B5B] hover:text-emerald-700 transition-colors cursor-pointer"
                          >
                            <span>Sesuaikan Harga</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Card 2: Stock Alert */}
                        <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:border-emerald-100 transition-all space-y-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs font-bold text-gray-900 leading-snug">
                              Stok Sirup Gula Aren sisa 5 cup lagi.
                            </h4>
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                              Kritis
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-tight">
                            Penjualan Kopi Susu tinggi. Pesan ulang sebelum jam sibuk.
                          </p>
                          <button
                            type="button"
                            onClick={() => showToast('Membuka pesanan supplier bahan baku Gula Aren...')}
                            className="pt-1 flex items-center gap-1 text-[11px] font-bold text-[#009B5B] hover:text-emerald-700 transition-colors cursor-pointer"
                          >
                            <span>Pesan Bahan Baku</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Card 3: Quick Insights */}
                        <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.02)] space-y-1.5">
                          <h4 className="text-xs font-bold text-gray-900">
                            Quick Insights
                          </h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-[11px]">Prediksi Omzet</span>
                              <span className="text-[10px] font-bold text-[#009B5B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60">
                                +3.5%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-[11px]">Target Margin</span>
                              <span className="text-[10px] font-bold text-[#009B5B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60">
                                On track
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-[11px]">Evaluasi Menu</span>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/60">
                                2 Pending
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Suggested next steps (Pill buttons row) */}
                        <div className="pt-1">
                          <p className="text-[11px] font-bold text-gray-700 mb-1.5">
                            Saran langkah cepat:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAskAi(null, 'Review evaluasi harga dan margin produk')}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-gray-200/90 rounded-lg text-[10px] font-medium text-gray-700 hover:text-[#009B5B] transition-all cursor-pointer"
                            >
                              Review margin (2)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAskAi(null, 'Follow up supplier bahan baku')}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-gray-200/90 rounded-lg text-[10px] font-medium text-gray-700 hover:text-[#009B5B] transition-all cursor-pointer"
                            >
                              Stok bahan (1)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAskAi(null, 'Cek status kas laci kasir')}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-gray-200/90 rounded-lg text-[10px] font-medium text-gray-700 hover:text-[#009B5B] transition-all cursor-pointer"
                            >
                              Kas kasir
                            </button>
                          </div>
                        </div>

                        {/* AI Chat Input Box (Compact) */}
                        <form
                          onSubmit={(e) => handleAskAi(e)}
                          className="mt-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 flex items-center gap-2 focus-within:border-[#009B5B] focus-within:ring-2 focus-within:ring-emerald-100 transition-all"
                        >
                          <input
                            type="text"
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            placeholder="Tanya AI UntungJelas..."
                            className="flex-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                          />
                          <button
                            type="submit"
                            disabled={!aiQuestion.trim()}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                              aiQuestion.trim()
                                ? 'bg-[#009B5B] text-white shadow-sm hover:bg-[#00874e]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </form>

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
          </>
        )}

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

    </div>
  )
}
