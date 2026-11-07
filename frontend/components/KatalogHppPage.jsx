import React, { useState, useMemo } from 'react'
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
  TrendingUp,
  Sparkles,
  Banknote,
  BookOpen,
  Layers,
  X
} from 'lucide-react'

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

export default function KatalogHppPage({ catalog = [], onUpdateCatalog, onToast }) {
  // Navigation view: 'list' | 'add' | 'edit'
  const [view, setView] = useState('list')
  const [editingProduct, setEditingProduct] = useState(null)

  // Filters on list view
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [statusFilter, setStatusFilter] = useState('Semua Status')
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
    setShowAddIngredientForm(true)
    setView('add')
  }

  // Open Edit view
  const handleOpenEdit = (product) => {
    setEditingProduct(product)
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

  // Save product
  const handleSaveProduct = () => {
    if (!formData.name.trim()) {
      if (onToast) onToast('Mohon masukkan nama produk!')
      return
    }

    const calculatedHpp = currentFormHpp > 0 ? currentFormHpp : (editingProduct?.hpp || 5000)
    const priceNum = Number(formData.price) || 18000
    const profitNum = priceNum - calculatedHpp
    const marginNum = priceNum > 0 ? Math.round((profitNum / priceNum) * 100) : 0

    let imagePath = formData.image
    if (!imagePath) {
      if (formData.category === 'Pastry & Bakery') imagePath = '/assets/kasir/croissant.png'
      else if (formData.category === 'Makanan') imagePath = '/assets/kasir/roti-bakar.png'
      else imagePath = '/assets/kasir/kopi-susu.png'
    }

    if (view === 'add') {
      const newProd = {
        id: Date.now(),
        name: formData.name.trim(),
        category: formData.category,
        sku: formData.sku.trim() || `BEV00${catalog.length + 1}`,
        price: priceNum,
        hpp: calculatedHpp,
        profit: profitNum,
        marginPct: marginNum,
        image: imagePath,
        ingredients: formData.ingredients,
        notes: formData.notes,
        popular: false
      }

      const updated = [newProd, ...catalog]
      if (onUpdateCatalog) onUpdateCatalog(updated)
      if (onToast) onToast(`✨ Produk "${newProd.name}" berhasil diterbitkan!`)
      setView('list')
    } else if (view === 'edit' && editingProduct) {
      const updated = catalog.map((item) => {
        if (item.id === editingProduct.id) {
          return {
            ...item,
            name: formData.name.trim(),
            category: formData.category,
            sku: formData.sku.trim() || item.sku,
            price: priceNum,
            hpp: calculatedHpp,
            profit: profitNum,
            marginPct: marginNum,
            ingredients: formData.ingredients,
            notes: formData.notes,
            image: imagePath
          }
        }
        return item
      })

      if (onUpdateCatalog) onUpdateCatalog(updated)
      if (onToast) onToast(`✨ Resep & produk "${formData.name}" berhasil diperbarui!`)
      setView('list')
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
  // VIEW: EDIT RESEP PRODUK & TAMBAH PRODUK
  // =========================================================================
  if (view === 'add' || view === 'edit') {
    const isEdit = view === 'edit'

    return (
      <div className="space-y-5 animate-fade-in pb-12">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {isEdit ? 'Edit Resep Produk' : 'Tambah Produk & Resep Baru'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? 'Atur porsi bahan baku untuk menghitung modal dasar (HPP) otomatis.'
                : 'Masukkan informasi menu dan racik takaran bahan baku untuk menghitung modal dasar (HPP) otomatis secara akurat.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onToast) onToast('Fitur Import CSV/Excel akan segera hadir!')
              }}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-gray-500" />
              <span>Import CSV / Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setView('list')}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Batal / Kembali</span>
            </button>
          </div>
        </div>

        {/* 2-Column Clean Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ================= LEFT COLUMN: INFORMASI PRODUK & RESEP (7 COLS) ================= */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-5 shadow-xs">
            
            {/* Header: Informasi Produk & SKU Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#009F58]" />
                <h3 className="font-bold text-sm sm:text-base text-gray-900">
                  Informasi Produk
                </h3>
              </div>
              {isEdit && formData.sku && (
                <span className="px-3 py-1 bg-emerald-50 text-[#009F58] border border-emerald-200/80 font-bold text-xs rounded-xl font-mono">
                  SKU: {formData.sku}
                </span>
              )}
            </div>

            {/* Nama Produk */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Nama Produk
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Kopi Susu Gula Aren"
                className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-[#009F58] outline-none transition-all font-medium"
              />
            </div>

            {/* Kategori & SKU Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-[#009F58] outline-none transition-all pr-8 cursor-pointer font-medium"
                  >
                    <option value="Minuman">Minuman</option>
                    <option value="Pastry & Bakery">Pastry & Bakery</option>
                    <option value="Makanan">Makanan</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {!isEdit && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    SKU Produk
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Contoh: BEV008"
                      className="flex-1 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:border-[#009F58] outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAutoSku}
                      className="px-3.5 py-2.5 bg-[#009F58] hover:bg-[#008f4f] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Auto
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Komposisi Takaran Resep Header */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-900 mb-2">
                Komposisi Takaran Resep
              </h4>

              {/* Ingredients Table */}
              <div className="border border-emerald-100 rounded-xl overflow-hidden bg-white">
                {/* Table Header: Clean emerald background */}
                <div className="grid grid-cols-12 bg-emerald-50/80 px-4 py-2.5 text-xs font-bold text-emerald-900 border-b border-emerald-100">
                  <div className="col-span-5">Nama Bahan Baku</div>
                  <div className="col-span-3 text-center">Takaran</div>
                  <div className="col-span-3 text-right">Modal Bahan</div>
                  <div className="col-span-1 text-center"></div>
                </div>

                {/* Table Rows or Empty State */}
                {formData.ingredients.length > 0 ? (
                  <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
                    {formData.ingredients.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 px-4 py-2.5 text-xs items-center hover:bg-gray-50/70 transition-colors"
                      >
                        <div className="col-span-5 pr-2">
                          <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{item.detail}</p>
                        </div>
                        <div className="col-span-3 text-center text-gray-700 font-medium">
                          {item.amount}
                        </div>
                        <div className="col-span-3 text-right font-bold text-[#009F58]">
                          Rp{Number(item.cost).toLocaleString('id-ID')}
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(item.id)}
                            className="text-gray-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title="Hapus Bahan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009F58] flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <p className="text-xs font-bold text-gray-800">
                      Belum ada bahan baku yang dimasukkan
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                      Tambahkan bahan dasar seperti espresso shot, susu UHT, sirup perisa, atau kemasan cup & sedotan pada formulir di bawah ini.
                    </p>
                  </div>
                )}
              </div>

              {/* Add Ingredient Form or Button */}
              {(!isEdit || showAddIngredientForm) ? (
                <div className="mt-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-gray-700">
                      Input Bahan Baru ke Resep
                    </p>
                    {isEdit && (
                      <button
                        type="button"
                        onClick={() => setShowAddIngredientForm(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={ingredientInput.name}
                      onChange={(e) => setIngredientInput({ ...ingredientInput, name: e.target.value })}
                      placeholder="Contoh: Kopi Espresso"
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#009F58]"
                    />
                    <input
                      type="text"
                      value={ingredientInput.amount}
                      onChange={(e) => setIngredientInput({ ...ingredientInput, amount: e.target.value })}
                      placeholder="Contoh: 15 gram"
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#009F58]"
                    />
                    <input
                      type="number"
                      value={ingredientInput.cost}
                      onChange={(e) => setIngredientInput({ ...ingredientInput, cost: e.target.value })}
                      placeholder="Contoh: Rp2500"
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-[#009F58]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="w-full py-2 bg-white hover:bg-gray-100 text-gray-700 border border-dashed border-gray-300 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#009F58]" />
                    <span>+ Tambah Bahan Baku</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddIngredientForm(true)}
                  className="mt-3 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                  <span>+ Tambah Bahan Baku</span>
                </button>
              )}

              {/* Total Modal Dasar (HPP) Card (Soft green tint) */}
              <div className="mt-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#009F58] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">
                      Total Modal Dasar (HPP)
                    </h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {currentFormHpp > 0
                        ? `100% Akurat Terhadap Stok (${formData.ingredients.length} bahan terdaftar)`
                        : 'Modal dasar akan dihitung otomatis saat bahan dan kemasan ditambahkan.'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-[#009F58] leading-none block">
                    Rp{currentFormHpp.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    /porsi racikan
                  </span>
                </div>
              </div>
            </div>

            {/* Tambahkan Catatan */}
            {!isEdit && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Tambahkan Catatan
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tuliskan catatan cara pembuatan atau takaran standar untuk panduan kasir / barista (opsional)... Contoh: Ekstraksi espresso 25 detik, tuang sirup terlebih dahulu sebelum es batu."
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-[#009F58] outline-none resize-none"
                />
              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN: SIMULATOR HARGA & AI INSIGHT (5 COLS) ================= */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-4 shadow-xs">
              
              {/* Header: Simulator Harga Jual */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#009F58]" />
                  <h3 className="font-bold text-sm text-gray-900">
                    Simulator Harga Jual
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  Real-time Margin
                </span>
              </div>

              {/* Rencanakan Harga Jual Konsumen */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Rencanakan Harga Jual Konsumen
                </label>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#009F58]">
                  <span className="px-2.5 py-1 bg-[#009F58] text-white font-bold text-xs rounded-lg mr-3">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Masukan Target Harga"
                    className="flex-1 text-xl sm:text-2xl font-bold text-gray-900 outline-none"
                  />
                  <SquarePen className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* 2 Metrics: Estimasi Untung Bersih & Persentase Margin */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-semibold">Estimasi Untung Bersih</span>
                    <Banknote className="w-3.5 h-3.5 text-[#009F58]" />
                  </div>
                  <p className={`text-xl font-black mt-1 ${currentNetProfit >= 0 ? 'text-[#009F58]' : 'text-[#D32F2F]'}`}>
                    {currentNetProfit >= 0 ? '+' : ''}Rp{currentNetProfit.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {isEdit ? 'Laba kotor per cup' : 'Laba kotor per porsi'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-semibold">Persentase Margin</span>
                    <TrendingUp className="w-3.5 h-3.5 text-[#009F58]" />
                  </div>
                  <p className="text-xl font-black text-[#009F58] mt-1">
                    {currentMarginPct}%
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {isEdit ? 'Basis harga menu' : 'Target sehat: 55% - 70%'}
                  </span>
                </div>
              </div>

              {/* Status Margin Banner */}
              <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between text-xs">
                {isEdit ? (
                  <span className="px-3 py-1 bg-emerald-50 text-[#009F58] border border-emerald-200 font-bold text-xs rounded-xl">
                    Margin Sehat
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 font-bold text-xs rounded-xl">
                    Status Margin
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Target minimal café: 55%
                </span>
              </div>

              {/* Insight Bisnis AI Box: Solid Green Top Bar */}
              <div className="rounded-xl overflow-hidden border border-emerald-100">
                {/* Header bar: Brand Green */}
                <div className="bg-[#009F58] px-3.5 py-2.5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-white text-[#009F58] flex items-center justify-center">
                      <Sparkles className="w-3 h-3 fill-current" />
                    </div>
                    <span className="font-bold text-xs">Insight Bisnis AI</span>
                  </div>
                  <span className="text-[10px] text-emerald-100">
                    AI Insights Real-Time
                  </span>
                </div>

                {/* Body Text */}
                <div className="p-3.5 bg-white space-y-2.5">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {isEdit ? (
                      'Margin produk ini sangat sehat (72,2%), berada di atas benchmark café F&B (55-70%). Anda memiliki ruang yang cukup untuk promosi bundling atau loyalty program!'
                    ) : (
                      'AI akan menganalisis kelayakan margin dan memberikan saran rekomendasi harga optimal berdasarkan data pasar F&B setelah Anda memasukkan komposisi resep.'
                    )}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#009F58]" />
                    <span>Dianalisis dari data pasar F&B Jakarta Selatan (Kuartal Terbaru)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Big Action Submit Button */}
            <button
              type="button"
              onClick={handleSaveProduct}
              className="w-full py-4 px-6 rounded-2xl bg-[#009F58] hover:bg-[#008f4f] text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all cursor-pointer text-center"
            >
              {isEdit ? 'Simpan Perubahan Resep & Produk' : 'Simpan & Terbitkan Produk'}
            </button>

          </div>

        </div>
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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Total Menu Aktif</span>
              <Utensils className="w-4 h-4 text-gray-800" />
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {metrics.totalMenu} Produk
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {metrics.minumanCount} Minuman, {metrics.pastryCount} Pastry, {metrics.makananCount} Makanan
            </p>
          </div>

          {/* Multi-color segment progress bar: Green + Amber + Light Emerald */}
          <div className="h-2 w-full rounded-full bg-gray-100 mt-4 flex overflow-hidden">
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
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Rata-rata Margin Usaha</span>
              <TrendingUp className="w-4 h-4 text-[#009F58]" />
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-[#009F58] tracking-tight">
                {metrics.avgMargin}%
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Target Min. 30%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Aman untuk beban operasional & sewa
          </p>
        </div>

        {/* Card 3: Perlu Evaluasi Margin (Fix: No collision with '1 Produk') */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Perlu Evaluasi Margin</span>
              <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-[#D32F2F] tracking-tight">
                {metrics.evalCount} Produk
              </span>
              {metrics.evalCount > 0 && (
                <span className="text-[11px] font-bold text-[#D32F2F] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                  Prioritas Koreksi
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">
              {metrics.rugiCount} Rugi, {metrics.tipisCount} Margin Tipis
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'Rugi' ? 'Semua Status' : 'Rugi')}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-[#D32F2F] font-bold text-xs rounded-lg transition-colors cursor-pointer"
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
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:border-[#009F58] cursor-pointer"
            >
              <option value="Semua Status">Status: Semua Status</option>
              <option value="Sehat">Status: Sehat</option>
              <option value="Tipis">Status: Margin Tipis</option>
              <option value="Rugi">Status: Rugi</option>
            </select>
            <Sliders className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

      {/* ================= PRODUCT TABLE (Clean, Professional) ================= */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header: Soft emerald tint */}
            <thead>
              <tr className="bg-emerald-50/70 text-emerald-950 text-xs font-bold border-b border-emerald-100/70">
                <th className="py-3 px-5">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">HPP</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4">Margin</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center"></th>
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

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isRugi
                          ? 'bg-[#FFF5F5] hover:bg-[#FFEAEA]'
                          : 'hover:bg-gray-50/70'
                      }`}
                    >
                      {/* Product Name + Image + SKU */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900 text-xs sm:text-[13px]">
                              {item.name}
                            </h5>
                            <span className="text-[11px] text-gray-400 font-mono">
                              SKU: {item.sku || `BEV00${item.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kategori Badge */}
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 bg-emerald-50 text-[#009F58] border border-emerald-100 font-medium text-xs rounded-full inline-block">
                          {item.category === 'Pastry & Bakery' ? 'Pastry' : item.category}
                        </span>
                      </td>

                      {/* HPP */}
                      <td className={`py-3.5 px-4 font-bold ${isRugi ? 'text-[#D32F2F]' : 'text-gray-800'}`}>
                        Rp{hpp.toLocaleString('id-ID')}
                      </td>

                      {/* Harga Jual */}
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        Rp{price.toLocaleString('id-ID')}
                      </td>

                      {/* Margin (Nominal + %) */}
                      <td className="py-3.5 px-4">
                        <p className={`font-bold ${isRugi ? 'text-[#D32F2F]' : 'text-[#009F58]'}`}>
                          {profit >= 0 ? '+' : ''}Rp{profit.toLocaleString('id-ID')}
                        </p>
                        <span className={`text-[10px] ${isRugi ? 'text-[#D32F2F]' : 'text-[#009F58]'}`}>
                          {marginPct}% margin
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-4 text-center">
                        {isRugi ? (
                          <span className="px-3 py-1 bg-rose-50 text-[#D32F2F] border border-rose-200 font-bold text-xs rounded-full inline-block">
                            Rugi
                          </span>
                        ) : isTipis ? (
                          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs rounded-full inline-block">
                            Tipis
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-[#009F58] text-white font-bold text-xs rounded-full inline-block shadow-2xs">
                            Sehat
                          </span>
                        )}
                      </td>

                      {/* Action Edit */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Resep & Produk"
                          className="p-1.5 text-gray-400 hover:text-[#009F58] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
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

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentPage === page
                    ? 'bg-[#009F58] text-white shadow-xs'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
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
                className="w-8 h-8 rounded-lg text-xs font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
