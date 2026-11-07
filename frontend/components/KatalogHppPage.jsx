import React, { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Plus,
  Upload,
  ChevronLeft,
  ChevronDown,
  Utensils,
  Coffee,
  Croissant,
  Sliders,
  ArrowUpDown,
  SquarePen,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Banknote,
  BookOpen,
  Layers,
  Check,
  Save,
  Image as ImageIcon,
  Calculator,
  Package,
  Info,
  Percent,
  X,
  Loader2
} from 'lucide-react'
import api from '../services/api'

// Recipe ingredients default dataset
const DEFAULT_RECIPES = {
  'Kopi Susu Gula Aren': [
    { id: 1, name: 'Espresso Shot', detail: 'Arabica Blend House Roastery', amount: '15 gram', cost: 2250 },
    { id: 2, name: 'Susu Segar', detail: 'UHT Fresh Milk Diamond', amount: '100 ml', cost: 1800 },
    { id: 3, name: 'Gula Aren Cair', detail: 'Sirup Murni Merah Jaya', amount: '20 ml', cost: 500 },
    { id: 4, name: 'Cup Plastik & Sedotan', detail: 'Adinda Plastik', amount: '1 set', cost: 450 },
  ],
  'Croissant Cokelat': [
    { id: 1, name: 'Adonan Croissant Butter', detail: 'French Butter Dough Sheet', amount: '1 pcs', cost: 8500 },
    { id: 2, name: 'Cokelat Isian Batang', detail: 'Baking Chocolate 55%', amount: '20 gram', cost: 1500 },
    { id: 3, name: 'Kemasan Paper Bag', detail: 'Kraft Food Grade Bag', amount: '1 set', cost: 500 },
  ],
  'Cafe Latte Gayo': [
    { id: 1, name: 'Double Shot Espresso', detail: 'Single Origin Gayo Honey', amount: '30 ml', cost: 4500 },
    { id: 2, name: 'Fresh Milk Steam', detail: 'Greenfields Fresh Milk', amount: '180 ml', cost: 4400 },
    { id: 3, name: 'Paper Hot Cup 8oz & Lid', detail: 'Eco Heat Cup Set', amount: '1 set', cost: 5000 },
  ],
  'Matcha Latte Kyoto': [
    { id: 1, name: 'Pure Kyoto Uji Matcha', detail: 'Grade A Ceremonial Powder', amount: '8 gram', cost: 7200 },
    { id: 2, name: 'Fresh Milk & Simple Syrup', detail: 'Diamond Milk + Cane Sugar', amount: '150 ml', cost: 3800 },
    { id: 3, name: 'Plastic Cup 16oz + Seal', detail: 'Clear PP Cup Seal Film', amount: '1 set', cost: 4000 },
  ],
  'Roti Bakar Coklat': [
    { id: 1, name: 'Roti Brioche Tebal', detail: 'Homemade Brioche Bread', amount: '2 slice', cost: 4000 },
    { id: 2, name: 'Selai Cokelat Hazelnut', detail: 'Rich Chocolate Spread', amount: '40 gram', cost: 4800 },
    { id: 3, name: 'Mentega Wijsman / Butter', detail: 'Salted Butter Glaze', amount: '15 gram', cost: 2000 },
  ],
  'Spaghetti Aglio Olio': [
    { id: 1, name: 'Pasta Spaghetti No. 5', detail: 'Italian Durum Wheat', amount: '120 gram', cost: 4800 },
    { id: 2, name: 'Smoked Beef Slice', detail: 'Daging Asap Premium', amount: '50 gram', cost: 6500 },
    { id: 3, name: 'Extra Virgin Olive Oil & Garlic', detail: 'Minyak Zaitun + Bawang', amount: '1 porsi', cost: 5500 },
  ],
  'Cold Brew Coffee': [
    { id: 1, name: 'Biji Kopi Arabica Toraja', detail: 'Coarse Grind Steeping 12 Jam', amount: '35 gram', cost: 7500 },
    { id: 2, name: 'Air Mineral Filtered RO', detail: 'Reverse Osmosis Steeping', amount: '250 ml', cost: 1100 },
    { id: 3, name: 'Botol Kaca 250ml & Label', detail: 'Glass Bottle Custom Logo', amount: '1 pcs', cost: 4000 },
  ],
  'Almond Croissant': [
    { id: 1, name: 'Croissant Plain Butter', detail: 'Base Twice-Baked Pastry', amount: '1 pcs', cost: 6500 },
    { id: 2, name: 'Almond Cream Frangipane', detail: 'Krim Almond Panggang', amount: '35 gram', cost: 3500 },
    { id: 3, name: 'Topping Roasted Almond Slice', detail: 'Kacang Almond Panggang', amount: '15 gram', cost: 2200 },
  ]
}

const PRODUCT_IMAGE_PRESETS = [
  { id: 'kopi-susu', label: 'Kopi Susu', path: '/assets/kasir/kopi-susu.png' },
  { id: 'cafe-latte', label: 'Cafe Latte', path: '/assets/kasir/cafe-latte.png' },
  { id: 'cold-brew', label: 'Cold Brew', path: '/assets/kasir/cold-brew.png' },
  { id: 'matcha-latte', label: 'Matcha Latte', path: '/assets/kasir/matcha-latte.png' },
  { id: 'croissant', label: 'Croissant', path: '/assets/kasir/croissant.png' },
  { id: 'almond-croissant', label: 'Almond Pastry', path: '/assets/kasir/almond-croissant.png' },
  { id: 'roti-bakar', label: 'Roti Bakar', path: '/assets/kasir/roti-bakar.png' },
  { id: 'spaghetti', label: 'Spaghetti', path: '/assets/kasir/spaghetti.png' },
]

const QUICK_INGREDIENTS = [
  { name: 'Espresso Shot', detail: 'House Blend 100% Arabica', amount: '15 gram', cost: 2250, type: 'Bahan Baku' },
  { name: 'Fresh Milk UHT', detail: 'Diamond / Greenfields Fresh', amount: '120 ml', cost: 1800, type: 'Bahan Baku' },
  { name: 'Gula Aren Cair', detail: 'Gula Aren Murni Organik', amount: '20 ml', cost: 500, type: 'Bahan Baku' },
  { name: 'Sirup Perisa', detail: 'Caramel / Vanilla / Hazelnut', amount: '15 ml', cost: 1200, type: 'Bahan Baku' },
  { name: 'Kyoto Matcha Powder', detail: 'Grade A Ceremonial Uji', amount: '8 gram', cost: 4500, type: 'Bahan Baku' },
  { name: 'Cup PP 16oz + Sedotan', detail: 'Cup Plastik + Straw + Sealer', amount: '1 set', cost: 450, type: 'Kemasan' },
  { name: 'Paper Hot Cup 8oz', detail: 'Heat Insulated Cup + Lid', amount: '1 set', cost: 650, type: 'Kemasan' },
  { name: 'Dough Croissant Butter', detail: 'Frozen Raw Sheet Dough', amount: '1 pcs', cost: 7500, type: 'Bahan Baku' },
]

function CategoryDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const options = [
    { id: 'Minuman', label: 'Minuman', icon: Coffee },
    { id: 'Pastry & Bakery', label: 'Pastry & Bakery', icon: Croissant },
    { id: 'Makanan', label: 'Makanan', icon: Utensils }
  ]
  const current = options.find((o) => o.id === value) || options[0]
  const CurrentIcon = current.icon

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50/80 border rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
          isOpen
            ? 'bg-white border-[#009F58] ring-2 ring-[#009F58]/10 text-gray-900'
            : 'border-gray-200 hover:border-gray-300 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4 text-[#009F58]" />
          <span>{current.label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#009F58]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.1)] border border-gray-100 p-1.5 z-50 animate-fade-in">
            <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Pilih Kategori
              </p>
            </div>
            {options.map((opt) => {
              const Icon = opt.icon
              const isSelected = value === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-[#009F58] font-bold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#009F58]' : 'text-gray-400'}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#009F58]" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function KatalogHppPage({ catalog = [], onUpdateCatalog, onToast }) {
  // Navigation view: 'list' | 'add' | 'edit'
  const [view, setView] = useState('list')
  const [editingProduct, setEditingProduct] = useState(null)

  // Filters on list view
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('default')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Minuman',
    sku: '',
    price: 18000,
    ingredients: [],
    notes: '',
    image: '/assets/kasir/kopi-susu.png'
  })

  // Show inline ingredient input in Edit view
  const [showAddIngredientForm, setShowAddIngredientForm] = useState(false)
  const [ingredientInput, setIngredientInput] = useState({
    name: '',
    detail: '',
    amount: '',
    cost: ''
  })
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false)

  // Loading & Backend Sync States
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // AI Advice States (GET /api/products/{id}/advice)
  const [adviceLoading, setAdviceLoading] = useState(false)
  const [adviceData, setAdviceData] = useState(null)
  const [adviceError, setAdviceError] = useState(null)
  const [showAdviceModal, setShowAdviceModal] = useState(false)

  // Live HPP calculation
  const currentFormHpp = useMemo(() => {
    return (formData.ingredients || []).reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
  }, [formData.ingredients])

  // Live profit & margin calculation
  const currentSellingPrice = Number(formData.price) || 0
  const currentNetProfit = currentSellingPrice - currentFormHpp
  const currentMarginPct = currentSellingPrice > 0
    ? ((currentNetProfit / currentSellingPrice) * 100).toFixed(1)
    : '0'

  // Summary Metrics (Clean, accurate stats)
  const metrics = useMemo(() => {
    const totalMenu = catalog.length
    const minumanCount = catalog.filter((c) => c.category === 'Minuman').length
    const pastryCount = catalog.filter((c) => c.category === 'Pastry & Bakery').length
    const makananCount = catalog.filter((c) => c.category === 'Makanan').length

    let totalMarginSum = 0
    let validCount = 0
    let rugiCount = 0
    let tipisCount = 0

    catalog.forEach((item) => {
      const price = item.price || 0
      const hpp = item.hpp || 0
      const profit = price - hpp
      const margin = price > 0 ? (profit / price) * 100 : 0
      totalMarginSum += margin
      validCount++

      if (profit < 0) {
        rugiCount++
      } else if (margin < 30) {
        tipisCount++
      }
    })

    const avgMargin = validCount > 0 ? (totalMarginSum / validCount).toFixed(1) : '36.2'

    return {
      totalMenu,
      minumanCount,
      pastryCount,
      makananCount,
      avgMargin,
      rugiCount,
      tipisCount,
      evalCount: rugiCount + tipisCount
    }
  }, [catalog])

  // Filtered and Sorted catalog list
  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false
      }
      const price = item.price || 0
      const hpp = item.hpp || 0
      const profit = price - hpp
      const margin = price > 0 ? (profit / price) * 100 : 0

      let itemStatus = 'Sehat'
      if (profit < 0) itemStatus = 'Rugi'
      else if (margin < 30) itemStatus = 'Tipis'

      if (statusFilter !== 'Semua Status' && itemStatus !== statusFilter) {
        return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = (item.name || '').toLowerCase().includes(q)
        const matchSku = (item.sku || '').toLowerCase().includes(q)
        const matchCat = (item.category || '').toLowerCase().includes(q)
        return matchName || matchSku || matchCat
      }

      return true
    }).sort((a, b) => {
      if (sortOrder === 'margin-desc') {
        const ma = a.price > 0 ? ((a.price - a.hpp) / a.price) : 0
        const mb = b.price > 0 ? ((b.price - b.hpp) / b.price) : 0
        return mb - ma
      }
      if (sortOrder === 'margin-asc') {
        const ma = a.price > 0 ? ((a.price - a.hpp) / a.price) : 0
        const mb = b.price > 0 ? ((b.price - b.hpp) / b.price) : 0
        return ma - mb
      }
      return 0
    })
  }, [catalog, selectedCategory, statusFilter, searchQuery, sortOrder])

  const paginatedCatalog = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredCatalog.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredCatalog, currentPage])

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / itemsPerPage))

  // Open Add view
  const handleOpenAdd = () => {
    const nextNum = catalog.length + 1
    const autoSku = `BEV${String(nextNum).padStart(3, '0')}`

    setFormData({
      name: '',
      category: 'Minuman',
      sku: autoSku,
      price: 18000,
      ingredients: [],
      notes: '',
      image: '/assets/kasir/kopi-susu.png'
    })
    setIngredientInput({ name: '', detail: '', amount: '', cost: '' })
    setIsTemplateDropdownOpen(false)
    setShowAddIngredientForm(true)
    setView('add')
  }

  // Open Edit view
  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setIsTemplateDropdownOpen(false)
    const existingRecipe = product.ingredients || DEFAULT_RECIPES[product.name] || [
      { id: 1, name: 'Bahan Baku Utama', detail: 'Formula Racikan Toko', amount: '1 porsi', cost: Math.round((product.hpp || 10000) * 0.8) },
      { id: 2, name: 'Kemasan Cup & Sedotan', detail: 'Standard Cup + Sedotan', amount: '1 set', cost: Math.round((product.hpp || 10000) * 0.2) }
    ]

    setFormData({
      name: product.name,
      category: product.category || 'Minuman',
      sku: product.sku || `BEV00${product.id}`,
      price: product.price || 18000,
      ingredients: [...existingRecipe],
      notes: product.notes || 'Takaran standar untuk barista kasir.',
      image: product.image || '/assets/kasir/kopi-susu.png'
    })
    setIngredientInput({ name: '', detail: '', amount: '', cost: '' })
    setShowAddIngredientForm(false)
    setView('edit')
  }

  // Add ingredient item
  const handleAddIngredient = () => {
    if (!ingredientInput.name.trim()) {
      if (onToast) onToast('Silakan isi nama bahan baku')
      return
    }
    const costNum = Number(ingredientInput.cost) || 0
    const newIt = {
      id: Date.now(),
      name: ingredientInput.name.trim(),
      detail: ingredientInput.detail.trim() || 'Racikan Standar',
      amount: ingredientInput.amount.trim() || '1 porsi',
      cost: costNum
    }

    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIt]
    }))

    setIngredientInput({ name: '', detail: '', amount: '', cost: '' })
    if (view === 'edit') setShowAddIngredientForm(false)
    if (onToast) onToast(`Bahan baku "${newIt.name}" ditambahkan!`)
  }

  // Delete ingredient item
  const handleDeleteIngredient = (id) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((it) => it.id !== id)
    }))
  }

  // Fetch real products from backend GET /api/products
  const fetchCatalog = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      const res = await api.get('/products')
      const productsData = (res.data?.data || []).map((p) => {
        const price = Number(p.selling_price) || 0
        const hpp = Number(p.modal_per_unit) || 0
        const profit = price - hpp
        const marginPct = price > 0 ? ((profit / price) * 100).toFixed(1) : '0'

        let img = '/assets/kasir/kopi-susu.png'
        const lowerName = (p.name || '').toLowerCase()
        if (lowerName.includes('croissant')) img = '/assets/kasir/croissant.png'
        else if (lowerName.includes('latte')) img = '/assets/kasir/cafe-latte.png'
        else if (lowerName.includes('cold') || lowerName.includes('brew')) img = '/assets/kasir/cold-brew.png'
        else if (lowerName.includes('matcha')) img = '/assets/kasir/matcha-latte.png'
        else if (lowerName.includes('roti')) img = '/assets/kasir/roti-bakar.png'
        else if (lowerName.includes('spaghetti') || lowerName.includes('pasta') || lowerName.includes('mie')) img = '/assets/kasir/spaghetti.png'

        let category = 'Minuman'
        if (lowerName.includes('croissant') || lowerName.includes('bakery') || lowerName.includes('pastry') || lowerName.includes('almond')) category = 'Pastry & Bakery'
        else if (lowerName.includes('roti') || lowerName.includes('spaghetti') || lowerName.includes('makan') || lowerName.includes('nasi') || lowerName.includes('ayam')) category = 'Makanan'

        const formattedIngredients = (p.ingredients || []).map((ing, idx) => ({
          id: ing.id || idx + 1,
          name: ing.name,
          detail: 'Takaran standar',
          amount: '1 porsi',
          cost: Number(ing.price) || 0,
        }))

        return {
          id: p.id,
          name: p.name,
          category: category,
          sku: `BEV${String(p.id).padStart(3, '0')}`,
          price: price,
          hpp: hpp,
          profit: profit,
          marginPct: marginPct,
          image: img,
          ingredients: formattedIngredients,
          notes: 'Formula resep terverifikasi',
          popular: false,
          status: p.status,
        }
      })

      if (onUpdateCatalog) onUpdateCatalog(productsData)
    } catch (err) {
      console.error('Gagal memuat katalog produk:', err)
      setLoadError('Gagal memuat katalog produk dari backend. Pastikan server backend aktif.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalog()
  }, [])

  // Save product to backend POST /api/products or PUT /api/products/{id}
  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      if (onToast) onToast('Mohon masukkan nama produk!')
      return
    }

    if (!formData.ingredients || formData.ingredients.length === 0) {
      if (onToast) onToast('Tambahkan minimal 1 bahan baku ke resep!')
      return
    }

    const priceNum = Number(formData.price) || 0
    if (priceNum <= 0) {
      if (onToast) onToast('Harga jual produk harus lebih besar dari Rp 0!')
      return
    }

    const payload = {
      name: formData.name.trim(),
      selling_price: priceNum,
      yield_qty: 1,
      ingredients: formData.ingredients.map((ing) => ({
        name: ing.name.trim(),
        price: Number(ing.cost) || 0,
      })),
    }

    setIsSaving(true)
    try {
      if (view === 'add') {
        await api.post('/products', payload)
        if (onToast) onToast(`✨ Produk "${payload.name}" berhasil disimpan ke sistem!`)
      } else if (view === 'edit' && editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload)
        if (onToast) onToast(`✨ Resep & harga "${payload.name}" berhasil diperbarui!`)
      }
      await fetchCatalog()
      setView('list')
    } catch (err) {
      console.error('Gagal menyimpan produk:', err)
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null) ||
        'Gagal menyimpan produk ke backend. Cek koneksi Anda.'
      if (onToast) onToast(`Gagal: ${errorMsg}`)
      alert(`Pemberitahuan:\n${errorMsg}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Delete product from backend DELETE /api/products/{id}
  const handleDeleteProduct = async (product) => {
    const targetProduct = product || editingProduct
    if (!targetProduct?.id) return
    if (!window.confirm(`Yakin ingin menghapus produk "${targetProduct.name}" dari katalog?`)) return

    try {
      await api.delete(`/products/${targetProduct.id}`)
      if (onToast) onToast(`Produk "${targetProduct.name}" berhasil dihapus.`)
      await fetchCatalog()
      if (view === 'edit') setView('list')
    } catch (err) {
      console.error('Gagal menghapus produk:', err)
      const errorMsg = err.response?.data?.message || 'Gagal menghapus produk dari backend.'
      if (onToast) onToast(`Gagal: ${errorMsg}`)
      alert(`Pemberitahuan:\n${errorMsg}`)
    }
  }

  // Request AI Price Advice from backend GET /api/products/{id}/advice
  const handleRequestAdvice = async (productId) => {
    const targetId = productId || editingProduct?.id
    if (!targetId) return

    setAdviceLoading(true)
    setAdviceError(null)
    setAdviceData(null)
    setShowAdviceModal(true)

    try {
      const res = await api.get(`/products/${targetId}/advice`)
      setAdviceData(res.data?.data || null)
    } catch (err) {
      console.error('Gagal meminta saran harga AI:', err)
      const errorMsg = err.response?.data?.message || 'Gagal terhubung ke layanan AI Gemini. Menampilkan fallback aturan.'
      setAdviceError(errorMsg)
    } finally {
      setAdviceLoading(false)
    }
  }

  // Auto SKU generator
  const handleAutoSku = () => {
    let prefix = 'BEV'
    if (formData.category === 'Pastry & Bakery') prefix = 'BAK'
    else if (formData.category === 'Makanan') prefix = 'FOD'
    const randomNum = Math.floor(100 + Math.random() * 900)
    setFormData((prev) => ({ ...prev, sku: `${prefix}${randomNum}` }))
  }

  // =========================================================================
  // VIEW: EDIT RESEP PRODUK & TAMBAH PRODUK (STUDIO RACIKAN HPP & HARGA)
  // =========================================================================
  if (view === 'add' || view === 'edit') {
    const isEdit = view === 'edit'
    const totalIngredients = formData.ingredients || []

    return (
      <div className="space-y-5 animate-fade-in pb-12">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
              <button
                type="button"
                onClick={() => setView('list')}
                className="hover:text-gray-900 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <span>Katalog HPP</span>
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-[#009F58] font-bold">
                {isEdit ? 'Edit Menu' : 'Tambah Menu & Resep Baru'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <span>{isEdit ? 'Edit Resep & Komposisi Menu' : 'Tambah Menu & Racikan HPP'}</span>
              {isEdit && formData.sku && (
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-lg border border-gray-200">
                  {formData.sku}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? 'Perbarui takaran resep, modal dasar (HPP), dan simulasikan harga jual menu usaha Anda.'
                : 'Racik takaran bahan baku, pantau modal dasar secara presisi, dan kalkulasi margin laba sehat F&B Anda.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEdit && (
              <button
                type="button"
                onClick={() => handleDeleteProduct(editingProduct)}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Hapus Produk Ini"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
              <span>Batal</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveProduct}
              className="px-5 py-2.5 bg-[#009F58] hover:bg-[#008f4f] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:shadow disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Menu'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ================= LEFT COLUMN: IDENTITAS MENU & KOMPOSISI RESEP (7 COLS) ================= */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Card 1: Identitas Menu & Foto */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#009F58] flex items-center justify-center">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      Identitas Menu
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Informasi dasar yang tampil di daftar menu dan kasir
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#009F58] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Aktif di Kasir
                </span>
              </div>

              {/* Foto Produk Picker (Hanya saat tambah menu baru) */}
              {!isEdit && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">
                    Pilih Foto / Ikon Menu
                  </label>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none]">
                    {PRODUCT_IMAGE_PRESETS.map((preset) => {
                      const isSelected = formData.image === preset.path
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: preset.path })}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 shrink-0 flex flex-col items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'border-[#009F58] bg-emerald-50/50 shadow-xs ring-2 ring-[#009F58]/20'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <img
                            src={preset.path}
                            alt={preset.label}
                            className="w-11 h-11 object-cover rounded-lg"
                          />
                          <span className={`text-[10px] font-semibold leading-none ${
                            isSelected ? 'text-[#009F58]' : 'text-gray-500'
                          }`}>
                            {preset.label}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#009F58] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Nama Menu & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Nama Menu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Kopi Susu Gula Aren"
                    className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 font-semibold focus:bg-white focus:border-[#009F58] focus:ring-2 focus:ring-[#009F58]/10 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Kategori Menu
                  </label>
                  <CategoryDropdown
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                  />
                </div>
              </div>

              {/* SKU & Panduan Barista */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Kode SKU
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoSku}
                      className="text-[10px] font-bold text-[#009F58] hover:underline cursor-pointer"
                    >
                      Acak Kode
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Contoh: BEV001"
                    className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 font-mono font-semibold focus:bg-white focus:border-[#009F58] outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Catatan Standar Penyajian <span className="text-[10px] text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Contoh: Ekstraksi 25 detik, es batu 120gr, kocok sebelum disajikan"
                    className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#009F58] outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Komposisi Resep & Modal Bahan (HPP) */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#009F58] flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      Komposisi Bahan & Kemasan (HPP)
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Rincian bahan mentah dan kemasan yang dipakai dalam 1 porsi
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {totalIngredients.length} Komponen
                </span>
              </div>

              {/* Table Komponen Bahan */}
              <div className="border border-gray-200/90 rounded-xl overflow-hidden bg-white">
                <div className="grid grid-cols-12 bg-gray-50/90 px-4 py-2.5 text-xs font-bold text-gray-700 border-b border-gray-100">
                  <div className="col-span-4 sm:col-span-5">Komponen Bahan</div>
                  <div className="col-span-3 sm:col-span-2 text-center">Takaran</div>
                  <div className="col-span-3 text-right">Modal Bahan</div>
                  <div className="col-span-2 text-center hidden sm:block">Porsi HPP</div>
                  <div className="col-span-2 sm:col-span-1 text-center"></div>
                </div>

                {totalIngredients.length > 0 ? (
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    {totalIngredients.map((item) => {
                      const costNum = Number(item.cost) || 0
                      const pctOfHpp = currentFormHpp > 0 ? Math.round((costNum / currentFormHpp) * 100) : 0
                      const isPackaging = /cup|sedotan|paper|kemasan|botol|bag|lid|box/i.test(item.name) || /cup|sedotan|paper|kemasan|botol|bag|lid|box/i.test(item.detail)
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-gray-50/70 transition-colors"
                        >
                          <div className="col-span-4 sm:col-span-5 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-gray-900 leading-tight">{item.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                isPackaging
                                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                                  : 'bg-emerald-50 text-[#009F58] border border-emerald-100'
                              }`}>
                                {isPackaging ? 'Kemasan' : 'Bahan'}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.detail || '-'}</p>
                          </div>
                          <div className="col-span-3 sm:col-span-2 text-center text-gray-700 font-semibold text-xs">
                            {item.amount}
                          </div>
                          <div className="col-span-3 text-right font-bold text-gray-900 text-xs">
                            Rp{costNum.toLocaleString('id-ID')}
                          </div>
                          <div className="col-span-2 text-center hidden sm:block">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-gray-500">{pctOfHpp}%</span>
                              <div className="w-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#009F58] rounded-full"
                                  style={{ width: `${Math.min(100, pctOfHpp)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 sm:col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteIngredient(item.id)}
                              className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer mx-auto"
                              title="Hapus Bahan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009F58] flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <p className="text-xs font-bold text-gray-800">
                      Belum ada bahan baku yang dimasukkan
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-[320px] mx-auto leading-relaxed">
                      Pilih dari template cepat di bawah atau masukkan takaran bahan seperti kopi, susu, sirup, hingga cup kemasan.
                    </p>
                  </div>
                )}
              </div>

              {/* Template Bahan Cepat F&B (Android Touch-Friendly Dropdown) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Pilih Cepat dari Template Bahan:
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                    className="w-full min-h-[44px] flex items-center justify-between px-3.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#009F58]" />
                      <span>{ingredientInput.name ? `Terpilih: ${ingredientInput.name}` : 'Pilih dari Template Bahan Baku Populer...'}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTemplateDropdownOpen ? 'rotate-180 text-[#009F58]' : ''}`} />
                  </button>

                  {isTemplateDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsTemplateDropdownOpen(false)} />
                      <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-gray-100 p-1.5 z-50 max-h-64 overflow-y-auto">
                        <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Daftar Bahan Baku Populer
                          </p>
                        </div>
                        {QUICK_INGREDIENTS.map((qi, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setIngredientInput({
                                name: qi.name,
                                detail: qi.detail,
                                amount: qi.amount,
                                cost: String(qi.cost)
                              })
                              setIsTemplateDropdownOpen(false)
                            }}
                            className="w-full min-h-[46px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs hover:bg-gray-50 transition-colors text-left cursor-pointer"
                          >
                            <div>
                              <span className="font-bold text-gray-900 block">{qi.name}</span>
                              <span className="text-[11px] text-gray-400 block mt-0.5">{qi.detail} • {qi.amount}</span>
                            </div>
                            <span className="font-bold text-[#009F58] shrink-0 font-mono text-xs">
                              Rp{qi.cost.toLocaleString('id-ID')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Input Bahan Baru Form */}
              <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/90 space-y-2.5">
                <span className="text-[11px] font-bold text-gray-700 block">
                  Tambah Bahan / Kemasan Baru
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={ingredientInput.name}
                      onChange={(e) => setIngredientInput({ ...ingredientInput, name: e.target.value })}
                      placeholder="Nama Bahan (Kopi / Susu / Cup)"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 outline-none focus:border-[#009F58]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={ingredientInput.detail}
                      onChange={(e) => setIngredientInput({ ...ingredientInput, detail: e.target.value })}
                      placeholder="Merk/Detail (contoh: Diamond)"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#009F58]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={ingredientInput.amount}
                      onChange={(e) => setIngredientInput({ ...ingredientInput, amount: e.target.value })}
                      placeholder="Takaran (15g / 100ml)"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-900 outline-none focus:border-[#009F58]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      value={ingredientInput.cost}
                      onChange={(e) => setIngredientInput({ ...ingredientInput, cost: e.target.value })}
                      placeholder="Biaya Rp (contoh: 2500)"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 outline-none focus:border-[#009F58]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#009F58] stroke-[2.5]" />
                  <span>Simpan Komponen ke Racikan Resep</span>
                </button>
              </div>

              {/* Total HPP Summary Bar (Clean, Minimalist - Zero AI Slop) */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/90 rounded-xl border border-gray-200 text-xs">
                <span className="font-bold text-gray-700">Total HPP per Porsi</span>
                <span className="text-lg font-black text-gray-900 font-mono">
                  Rp{currentFormHpp.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: SIMULATOR HARGA & MARGIN (5 COLS) ================= */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
              
              {/* Header: Simulator Harga & Margin */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#009F58] flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      Kalkulator Margin & Harga Jual
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Simulasi finansial per porsi produk
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  Real-Time
                </span>
              </div>

              {/* Rencanakan Harga Jual Konsumen */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>Rencana Harga Jual Konsumen</span>
                  <span className="text-[11px] font-normal text-gray-400">Tercetak di struk kasir</span>
                </label>
                <div className="flex items-center bg-gray-50/80 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#009F58] focus-within:ring-2 focus-within:ring-[#009F58]/10 transition-all">
                  <span className="px-2.5 py-1 bg-[#009F58] text-white font-bold text-xs rounded-lg mr-3 shadow-2xs">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={formData.price ? Number(formData.price).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, price: raw ? Number(raw) : 0 })
                    }}
                    placeholder="18.000"
                    className="flex-1 text-xl sm:text-2xl font-black text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
                  />
                  <SquarePen className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Target Margin Selector */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-gray-600 block">
                  Pilih Target Margin:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 65, 75].map((pct) => {
                    const suggestedPrice = currentFormHpp > 0 ? Math.ceil((currentFormHpp / (1 - pct / 100)) / 500) * 500 : 0
                    const isSelected = Number(formData.price) === suggestedPrice && suggestedPrice > 0
                    return (
                      <button
                        key={pct}
                        type="button"
                        disabled={currentFormHpp <= 0}
                        onClick={() => setFormData({ ...formData, price: suggestedPrice })}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-emerald-50 border-[#009F58] text-[#009F58] font-bold'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                        } ${currentFormHpp <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <span className="block text-xs font-medium text-gray-500">{pct}%</span>
                        <span className="block text-xs font-mono font-bold mt-0.5 text-gray-900">
                          {suggestedPrice > 0 ? `Rp${suggestedPrice.toLocaleString('id-ID')}` : '-'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Rincian Finansial Breakdown Card */}
              <div className="bg-gray-50/70 rounded-xl p-3.5 border border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Harga Jual Konsumen</span>
                  <span className="font-bold text-gray-900">Rp{currentSellingPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Modal Pokok Resep (HPP)</span>
                  <span className="font-bold text-[#D32F2F]">-Rp{currentFormHpp.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">Laba Kotor per Porsi</span>
                  <span className={`font-black text-sm ${currentNetProfit >= 0 ? 'text-[#009F58]' : 'text-[#D32F2F]'}`}>
                    {currentNetProfit >= 0 ? `+Rp${currentNetProfit.toLocaleString('id-ID')}` : `-Rp${Math.abs(currentNetProfit).toLocaleString('id-ID')}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Rasio Beban Bahan (Food Cost)</span>
                  <span className="font-bold text-gray-700">
                    {currentSellingPrice > 0 ? `${((currentFormHpp / currentSellingPrice) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">Margin Keuntungan Kotor</span>
                  <span className={`font-black text-base ${currentNetProfit < 0 ? 'text-[#D32F2F]' : Number(currentMarginPct) < 55 ? 'text-amber-600' : 'text-[#009F58]'}`}>
                    {currentMarginPct}%
                  </span>
                </div>
              </div>

              {/* Benchmark Standar F&B Alert Card */}
              <div className={`p-4 rounded-xl border text-xs transition-colors space-y-1.5 ${
                currentNetProfit < 0
                  ? 'bg-rose-50 border-rose-200 text-[#D32F2F]'
                  : Number(currentMarginPct) < 55
                  ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                  : 'bg-emerald-50/70 border-emerald-200 text-[#009F58]'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {currentNetProfit < 0 ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-[#D32F2F]" />
                      <span>Defisit / Potensi Merugi ({currentMarginPct}%)</span>
                    </>
                  ) : Number(currentMarginPct) < 55 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Margin Tipis ({currentMarginPct}%)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#009F58]" />
                      <span>Margin Sehat & Optimal ({currentMarginPct}%)</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-gray-600">
                  {currentNetProfit < 0
                    ? 'Harga jual berada di bawah biaya modal bahan. Anda akan merugi pada setiap porsi yang terjual. Segera naikkan harga jual atau efisiensikan bahan.'
                    : Number(currentMarginPct) < 55
                    ? 'Margin di bawah 55% rentan tidak cukup menutupi beban sewa, listrik, dan gaji pegawai café. Disarankan mencapai margin minimal 55% - 70%.'
                    : 'Margin berada di atas standar F&B (55% - 70%). Anda memiliki cadangan profit yang cukup kuat untuk biaya operasional dan promosi menu.'}
                </p>
              </div>

              {/* Proyeksi Penjualan Harian */}
              {currentNetProfit > 0 && (
                <div className="p-3.5 bg-gray-50/60 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                    <span>Estimasi Hasil Penjualan</span>
                    <span className="text-[10px] text-gray-400 font-normal">Proyeksi laba kotor</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 block">25 porsi / hari</span>
                      <span className="font-bold text-gray-900 block mt-0.5">
                        +Rp{(currentNetProfit * 25).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-[#009F58] font-semibold">
                        ~Rp{((currentNetProfit * 25 * 30) / 1000000).toFixed(1)}jt / bln
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 block">50 porsi / hari</span>
                      <span className="font-bold text-[#009F58] block mt-0.5">
                        +Rp{(currentNetProfit * 50).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-[#009F58] font-semibold">
                        ~Rp{((currentNetProfit * 50 * 30) / 1000000).toFixed(1)}jt / bln
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Advice Button (GET /api/products/{id}/advice) */}
              {isEdit && editingProduct?.id && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#009F58]" />
                      <span>Rekomendasi Harga AI Gemini</span>
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      AI Powered
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Dapatkan rekomendasi harga jual optimal berdasarkan biaya modal HPP dan margin industri F&B.
                  </p>
                  <button
                    type="button"
                    disabled={adviceLoading}
                    onClick={() => handleRequestAdvice(editingProduct.id)}
                    className="w-full py-2.5 bg-[#009F58] hover:bg-[#008f4f] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {adviceLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menganalisis margin dengan AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Minta Saran Harga AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>

            {/* Tombol Simpan Utama */}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveProduct}
              className="w-full py-3.5 px-6 rounded-xl bg-[#009F58] hover:bg-[#008f4f] text-white font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Server...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Simpan Perubahan Menu' : 'Simpan & Terbitkan Menu'}</span>
                </>
              )}
            </button>

          </div>

        </div>

        {/* Modal: Saran Harga AI Gemini */}
        {showAdviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#009F58] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Saran Harga AI Gemini</h3>
                    <p className="text-[11px] text-gray-500">{editingProduct?.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdviceModal(false)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {adviceLoading ? (
                <div className="py-8 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#009F58] mx-auto" />
                  <p className="text-xs font-semibold text-gray-700">Sedang menganalisis struktur HPP & margin...</p>
                  <p className="text-[11px] text-gray-400">Menghubungi layanan Gemini AI...</p>
                </div>
              ) : adviceError ? (
                <div className="py-4 space-y-3">
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-100">
                    {adviceError}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdviceModal(false)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              ) : adviceData ? (
                <div className="space-y-4">
                  {/* Rekomendasi Nominal */}
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-center">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      Rekomendasi Harga Jual Optimal
                    </span>
                    <span className="text-2xl font-black text-[#009F58] block my-1">
                      Rp{Number(adviceData.suggested_price || 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Margin ekspektasi:{' '}
                      <span className="font-bold text-emerald-700">{adviceData.expected_margin_percent}%</span>
                      {' • '}
                      <span className="font-medium">
                        {adviceData.source === 'ai' ? 'Analisis Gemini AI' : 'Smart Rule Engine'}
                      </span>
                    </span>
                  </div>

                  {/* Alasan / Reasons */}
                  {adviceData.reasons && adviceData.reasons.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-800 block">Dasar Pertimbangan:</span>
                      <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside">
                        {adviceData.reasons.map((r, i) => (
                          <li key={i} className="leading-relaxed">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Narasi Ringkas */}
                  {adviceData.narrative && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 italic leading-relaxed">
                      &ldquo;{adviceData.narrative}&rdquo;
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdviceModal(false)}
                      className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, price: Number(adviceData.suggested_price) || prev.price }))
                        setShowAdviceModal(false)
                        if (onToast) onToast(`Harga disesuaikan ke Rp${Number(adviceData.suggested_price).toLocaleString('id-ID')}`)
                      }}
                      className="w-2/3 py-2.5 bg-[#009F58] hover:bg-[#008f4f] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Terapkan Harga Ini</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

      </div>
    )
  }

  // =========================================================================
  // VIEW: KALKULATOR HPP & KATALOG PRODUK (LIST VIEW)
  // =========================================================================
  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Kalkulator HPP & Katalog Produk
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola resep, pantau modal dasar (HPP), dan racik porsi produk usahamu di sini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onToast) onToast('Ekspor data katalog (.csv) berhasil diunduh!')
            }}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#009F58] hover:bg-[#008f4f] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* ================= 3 CLEAN TOP SUMMARY CARDS (NO OUTER GREEN CONTAINER) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Total Menu Aktif */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-0.5">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Total Menu Aktif</span>
            <Utensils className="w-4 h-4 text-gray-800" />
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {metrics.totalMenu} Produk
          </p>
          <p className="text-xs text-gray-400">
            {metrics.minumanCount} Minuman, {metrics.pastryCount} Pastry, {metrics.makananCount} Makanan
          </p>

          {/* Multi-color segment progress bar: Green + Amber + Light Emerald */}
          <div className="h-1.5 w-full rounded-full bg-gray-100 !mt-3 flex overflow-hidden">
            <div
              className="bg-[#009F58]"
              style={{ width: `${(metrics.minumanCount / Math.max(1, metrics.totalMenu)) * 100}%` }}
              title="Minuman"
            />
            <div
              className="bg-amber-400"
              style={{ width: `${(metrics.pastryCount / Math.max(1, metrics.totalMenu)) * 100}%` }}
              title="Pastry"
            />
            <div
              className="bg-emerald-300"
              style={{ width: `${(metrics.makananCount / Math.max(1, metrics.totalMenu)) * 100}%` }}
              title="Makanan"
            />
          </div>
        </div>

        {/* Card 2: Rata-rata Margin Usaha */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-0.5">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Rata-rata Margin Usaha</span>
            <TrendingUp className="w-4 h-4 text-[#009F58]" />
          </div>
          <p className="text-2xl font-black text-[#009F58] tracking-tight">
            {metrics.avgMargin}%
          </p>
          <p className="text-xs text-gray-400 font-medium">
            Target Min. 30%
          </p>
          <p className="text-xs text-gray-400 !mt-3">
            Aman untuk beban operasional & sewa
          </p>
        </div>

        {/* Card 3: Perlu Evaluasi Margin */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-0.5">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Perlu Evaluasi Margin</span>
            <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
          </div>
          <p className="text-2xl font-black text-[#D32F2F] tracking-tight">
            {metrics.evalCount} Produk
          </p>
          {metrics.evalCount > 0 ? (
            <p className="text-xs text-[#D32F2F] font-bold">
              Prioritas Koreksi
            </p>
          ) : (
            <p className="text-xs text-emerald-600 font-medium">
              Semua Margin Sehat
            </p>
          )}

          <div className="flex items-center justify-between !mt-3">
            <span className="text-xs text-gray-400">
              {metrics.rugiCount} Rugi, {metrics.tipisCount} Margin Tipis
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'Rugi' ? 'Semua Status' : 'Rugi')}
              className="px-2.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-[#D32F2F] font-bold text-xs rounded-md transition-colors cursor-pointer"
            >
              Periksa
            </button>
          </div>
        </div>

      </div>

      {/* ================= SEARCH & STATUS FILTER ROW ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk, SKU, atau bahan baku kopi..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#009F58]"
          />
        </div>

        {/* Status Dropdown & Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className={`w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 pl-3 pr-2.5 py-2.5 bg-white border rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isStatusDropdownOpen
                  ? 'border-[#009F58] ring-2 ring-[#009F58]/10 text-gray-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {statusFilter === 'Semua Status'
                    ? 'Status: Semua Status'
                    : statusFilter === 'Tipis'
                    ? 'Status: Margin Tipis'
                    : `Status: ${statusFilter}`}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  isStatusDropdownOpen ? 'rotate-180 text-[#009F58]' : ''
                }`}
              />
            </button>

            {isStatusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsStatusDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.1)] border border-gray-100 p-1.5 z-50 animate-fade-in">
                  <div className="px-2.5 py-1.5 border-b border-gray-100 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Filter Status
                    </p>
                  </div>
                  {[
                    { id: 'Semua Status', label: 'Semua Status', icon: Sliders },
                    { id: 'Sehat', label: 'Status: Sehat', icon: CheckCircle2 },
                    { id: 'Tipis', label: 'Status: Margin Tipis', icon: AlertTriangle },
                    { id: 'Rugi', label: 'Status: Rugi', icon: AlertCircle }
                  ].map((opt) => {
                    const Icon = opt.icon
                    const isSelected = statusFilter === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.id)
                          setCurrentPage(1)
                          setIsStatusDropdownOpen(false)
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
              const next = sortOrder === 'default' ? 'margin-desc' : sortOrder === 'margin-desc' ? 'margin-asc' : 'default'
              setSortOrder(next)
              if (onToast) {
                if (next === 'margin-desc') onToast('Urutkan: Margin Tertinggi')
                else if (next === 'margin-asc') onToast('Urutkan: Margin Terendah')
                else onToast('Urutan default')
              }
            }}
            title="Urutkan Margin"
            className={`p-2.5 bg-white border rounded-xl transition-colors cursor-pointer ${
              sortOrder !== 'default'
                ? 'border-[#009F58] text-[#009F58] bg-emerald-50'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= CATEGORY TABS (Active: #009F58) ================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
        {[
          { id: 'Semua', label: `Semua (${catalog.length})`, icon: Layers },
          { id: 'Minuman', label: `Minuman (${metrics.minumanCount})`, icon: Coffee },
          { id: 'Pastry & Bakery', label: `Pastry & Bakery (${metrics.pastryCount})`, icon: Croissant },
          { id: 'Makanan', label: `Makanan (${metrics.makananCount})`, icon: Utensils },
        ].map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id)
                setCurrentPage(1)
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#009F58] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Backend Status Alerts */}
      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            type="button"
            onClick={fetchCatalog}
            className="font-bold underline text-rose-800 hover:text-rose-950 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {isLoading && (
        <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-gray-600 flex items-center justify-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-[#009F58]" />
          <span>Menyinkronkan data katalog produk dari backend...</span>
        </div>
      )}

      {/* ================= PRODUCT LIST & TABLE (Full Responsive Mobile & Desktop) ================= */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
        
        {/* MOBILE VIEW (CARDS): block md:hidden */}
        <div className="block md:hidden divide-y divide-gray-100">
          {paginatedCatalog.length > 0 ? (
            paginatedCatalog.map((item) => {
              const price = item.price || 0
              const hpp = item.hpp || 0
              const profit = price - hpp
              const marginPct = price > 0 ? ((profit / price) * 100).toFixed(1) : '0'

              const isRugi = profit < 0
              const isTipis = !isRugi && Number(marginPct) < 30
              const statusText = isRugi ? 'Rugi' : isTipis ? 'Tipis' : 'Sehat'

              return (
                <div
                  key={item.id}
                  className={`p-4 transition-colors ${
                    isRugi ? 'bg-[#FFF5F5]' : 'bg-white hover:bg-gray-50/60'
                  }`}
                >
                  {/* Top: Photo + Name + Category + Status + Edit Button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-gray-900 text-sm leading-tight truncate">
                            {item.name}
                          </h5>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isRugi
                              ? 'bg-rose-100 text-[#D32F2F]'
                              : isTipis
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-[#009F58]'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span className="font-mono text-[11px]">{item.sku || `BEV00${item.id}`}</span>
                          <span>•</span>
                          <span className="text-gray-600 font-medium">
                            {item.category === 'Pastry & Bakery' ? 'Pastry' : item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-[#009F58] border border-gray-200/80 transition-colors cursor-pointer"
                        title="Edit Menu"
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(item)}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-gray-200/80 transition-colors cursor-pointer"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom: 3-Metric Grid (HPP, Harga Jual, Margin) */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100/90 text-xs">
                    <div className="bg-gray-50/80 rounded-xl p-2.5">
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                        HPP
                      </span>
                      <span className={`font-black text-xs sm:text-sm block mt-0.5 ${isRugi ? 'text-[#D32F2F]' : 'text-gray-800'}`}>
                        Rp{hpp.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-2.5">
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                        Harga Jual
                      </span>
                      <span className="font-black text-xs sm:text-sm text-gray-900 block mt-0.5">
                        Rp{price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className={`rounded-xl p-2.5 ${isRugi ? 'bg-rose-50/80' : 'bg-emerald-50/60'}`}>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                        Margin
                      </span>
                      <span className={`font-black text-xs sm:text-sm block mt-0.5 ${isRugi ? 'text-[#D32F2F]' : 'text-[#009F58]'}`}>
                        {profit >= 0 ? `+Rp${profit.toLocaleString('id-ID')}` : `-Rp${Math.abs(profit).toLocaleString('id-ID')}`}
                      </span>
                      <span className={`text-[10px] font-bold block ${isRugi ? 'text-[#D32F2F]' : 'text-[#009F58]'}`}>
                        {profit >= 0 ? `${marginPct}%` : `-${Math.abs(Number(marginPct)).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              Tidak ada produk yang cocok dengan pencarian atau filter.
            </div>
          )}
        </div>

        {/* DESKTOP VIEW (TABLE): hidden md:block */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            {/* Table Header: Subtle light gray background */}
            <thead>
              <tr className="bg-gray-50/90 text-gray-700 text-xs font-bold border-b border-gray-100">
                <th className="py-3.5 px-5 text-left font-bold text-gray-700">Nama Produk</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Kategori</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">HPP</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Harga Jual</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Margin</th>
                <th className="py-3.5 px-4 text-left font-bold text-gray-700">Status</th>
                <th className="py-3.5 px-4 text-center font-bold text-gray-700 w-12"></th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedCatalog.length > 0 ? (
                paginatedCatalog.map((item) => {
                  const price = item.price || 0
                  const hpp = item.hpp || 0
                  const profit = price - hpp
                  const marginPct = price > 0 ? ((profit / price) * 100).toFixed(1) : '0'

                  const isRugi = profit < 0
                  const isTipis = !isRugi && Number(marginPct) < 30
                  const statusText = isRugi ? 'Rugi' : isTipis ? 'Tipis' : 'Sehat'

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isRugi
                          ? 'bg-[#FFF5F5] hover:bg-[#FFEBEB]'
                          : 'hover:bg-gray-50/80'
                      }`}
                    >
                      {/* Product Name + Image + SKU */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900 text-xs sm:text-[13px] leading-snug">
                              {item.name}
                            </h5>
                            <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
                              SKU: {item.sku || `BEV00${item.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kategori (Clean Text - No Pill) */}
                      <td className="py-4 px-4">
                        <span className="text-gray-700 font-medium text-xs sm:text-[13px]">
                          {item.category === 'Pastry & Bakery' ? 'Pastry' : item.category}
                        </span>
                      </td>

                      {/* HPP */}
                      <td className={`py-4 px-4 font-bold text-xs sm:text-[13px] ${isRugi ? 'text-[#D32F2F]' : 'text-gray-800'}`}>
                        Rp{hpp.toLocaleString('id-ID')}
                      </td>

                      {/* Harga Jual */}
                      <td className="py-4 px-4 font-bold text-gray-900 text-xs sm:text-[13px]">
                        Rp{price.toLocaleString('id-ID')}
                      </td>

                      {/* Margin (Nominal + %) */}
                      <td className="py-4 px-4">
                        <p className={`font-bold text-xs sm:text-[13px] ${isRugi ? 'text-[#D32F2F]' : 'text-[#009F58]'}`}>
                          {profit >= 0
                            ? `+Rp${profit.toLocaleString('id-ID')}`
                            : `-Rp${Math.abs(profit).toLocaleString('id-ID')}`}
                        </p>
                        <span className={`text-[11px] block mt-0.5 ${isRugi ? 'text-[#D32F2F]' : 'text-[#009F58]'}`}>
                          {profit >= 0 ? `${marginPct}%` : `-${Math.abs(Number(marginPct)).toFixed(1)}%`} margin
                        </span>
                      </td>

                      {/* Status (Clean Text - No Pill: Hijau if untung, Merah if rugi) */}
                      <td className="py-4 px-4 text-left">
                        <span
                          className={`font-bold text-xs sm:text-[13px] ${
                            isRugi
                              ? 'text-[#D32F2F]'
                              : isTipis
                              ? 'text-amber-600'
                              : 'text-[#009F58]'
                          }`}
                        >
                          {statusText}
                        </span>
                      </td>

                      {/* Action Edit & Delete */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Resep & Produk"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#009F58] hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <SquarePen className="w-4 h-4 stroke-[1.8]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(item)}
                            title="Hapus Produk"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.8]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    Tidak ada produk yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            Menampilkan <span className="font-bold text-gray-800">{paginatedCatalog.length}</span> dari{' '}
            <span className="font-bold text-gray-800">{filteredCatalog.length}</span> produk katalog
          </p>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
