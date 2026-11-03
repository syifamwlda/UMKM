import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package,
  Calculator,
  ArrowLeft,
  LogOut,
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  Loader2,
  UtensilsCrossed
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

// Helper format angka ke Rupiah
export const formatRupiah = (number) => {
  const val = Number(number) || 0
  return 'Rp ' + val.toLocaleString('id-ID')
}

export default function ProductHppPage({ onNavigateHome }) {
  const { user, logout } = useAuth()

  // State data produk
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // State Form Modal Tambah Produk
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Form Fields
  const [name, setName] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [yieldQty, setYieldQty] = useState('1')
  const [ingredients, setIngredients] = useState([
    { name: '', price: '' },
    { name: '', price: '' }
  ])

  // Ambil data produk dari backend GET /api/products
  const fetchProducts = async () => {
    setIsLoading(true)
    setFetchError('')
    try {
      const response = await api.get('/products')
      setProducts(response.data?.data || [])
    } catch (err) {
      if (err.response?.data?.message) {
        setFetchError(err.response.data.message)
      } else if (err.code === 'ERR_NETWORK') {
        setFetchError('Gagal terhubung ke backend (http://localhost:8000/api). Pastikan server backend sedang aktif.')
      } else {
        setFetchError('Terjadi kesalahan saat memuat daftar produk.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Kalkulasi Live Preview di Frontend (sesuai aturan di BRIEF.md)
  const livePreview = useMemo(() => {
    const sPrice = parseFloat(sellingPrice) || 0
    const yQty = parseFloat(yieldQty) > 0 ? parseFloat(yieldQty) : 1
    const totalIngredientsCost = ingredients.reduce((sum, item) => {
      const p = parseFloat(item.price) || 0
      return sum + p
    }, 0)

    const modalPerUnit = yQty > 0 ? totalIngredientsCost / yQty : 0
    const profitPerUnit = sPrice - modalPerUnit

    let marginPercent = 0
    if (sPrice > 0) {
      marginPercent = ((sPrice - modalPerUnit) / sPrice) * 100
    }

    let status = 'rugi'
    if (marginPercent >= 20) {
      status = 'sehat'
    } else if (marginPercent >= 0) {
      status = 'tipis'
    } else {
      status = 'rugi'
    }

    return {
      totalIngredientsCost,
      modalPerUnit,
      profitPerUnit,
      marginPercent: marginPercent.toFixed(2),
      status
    }
  }, [sellingPrice, yieldQty, ingredients])

  // Handler manipulasi baris bahan baku
  const handleAddIngredientRow = () => {
    setIngredients([...ingredients, { name: '', price: '' }])
  }

  const handleRemoveIngredientRow = (index) => {
    if (ingredients.length <= 1) return
    const updated = ingredients.filter((_, i) => i !== index)
    setIngredients(updated)
  }

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  const resetForm = () => {
    setName('')
    setSellingPrice('')
    setYieldQty('1')
    setIngredients([
      { name: '', price: '' },
      { name: '', price: '' }
    ])
    setFormError('')
    setFormSuccess('')
  }

  // Submit Produk Baru ke POST /api/products
  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    // Validasi Sisi Klien
    if (!name.trim()) {
      setFormError('Nama produk wajib diisi.')
      return
    }

    const priceNum = parseFloat(sellingPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Harga jual harus berupa angka yang lebih dari 0.')
      return
    }

    const yieldNum = parseFloat(yieldQty)
    if (isNaN(yieldNum) || yieldNum <= 0) {
      setFormError('Porsi resep (yield qty) minimal 1.')
      return
    }

    const validIngredients = ingredients
      .filter((ing) => ing.name.trim() !== '' && !isNaN(parseFloat(ing.price)))
      .map((ing) => ({
        name: ing.name.trim(),
        price: parseFloat(ing.price)
      }))

    if (validIngredients.length === 0) {
      setFormError('Tambahkan minimal 1 bahan baku dengan nama dan harga yang valid.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        selling_price: priceNum,
        yield_qty: yieldNum,
        ingredients: validIngredients
      }

      const response = await api.post('/products', payload)
      setFormSuccess(response.data?.message || 'Produk dan HPP berhasil disimpan!')
      
      // Ambil data terbaru
      await fetchProducts()

      setTimeout(() => {
        resetForm()
        setShowAddModal(false)
      }, 700)
    } catch (err) {
      if (err.response?.data?.message) {
        setFormError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0]
        setFormError(err.response.data.errors[firstKey][0])
      } else if (err.code === 'ERR_NETWORK') {
        setFormError('Gagal mengirim data ke server. Pastikan koneksi backend aktif.')
      } else {
        setFormError('Gagal menambahkan produk. Silakan periksa formulir.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render Status Badge
  const renderStatusBadge = (status, margin) => {
    const s = String(status).toLowerCase()
    if (s === 'sehat') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E6F9F0] text-[#009B5B] border border-[#A7F3D0]">
          <TrendingUp className="w-3 h-3 stroke-[2.5]" />
          <span>SEHAT ({margin}%)</span>
        </span>
      )
    } else if (s === 'tipis') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
          <Info className="w-3 h-3 stroke-[2.5]" />
          <span>TIPIS ({margin}%)</span>
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
          <TrendingDown className="w-3 h-3 stroke-[2.5]" />
          <span>RUGI ({margin}%)</span>
        </span>
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans antialiased pb-20">
      
      {/* ================= TOP NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EDEDED] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-gray-500 hover:text-gray-900 transition-colors p-1"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/assets/Icons/logo.png"
                alt="UntungJelas Logo"
                className="h-7 sm:h-8 w-auto object-contain"
              />
              <span className="text-lg sm:text-[19px] font-semibold text-gray-900">
                Untung<span className="text-[#259A66]">Jelas</span>
              </span>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="text-right hidden sm:block">
              <div className="text-xs sm:text-sm font-bold text-gray-900">
                {user?.business_name || 'Toko UMKM'}
              </div>
              <div className="text-[11px] text-gray-500">
                {user?.name ? `${user.name} (${user.phone})` : user?.phone}
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Hitung Modal & HPP Produk
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-2xl">
              Hitung modal sebenarnya (HPP) per porsi dari bahan baku, tentukan harga jual, dan ketahui status untung-rugimu.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchProducts}
              disabled={isLoading}
              className="p-2.5 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#009B5B]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="inline-flex items-center gap-2 bg-[#009B5B] hover:bg-[#00854d] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        {/* ================= STATE 1: ERROR STATE ================= */}
        {fetchError && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold">Gagal Memuat Data Produk</div>
                <div className="text-xs text-red-700 mt-0.5">{fetchError}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchProducts}
              className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ================= STATE 2: LOADING STATE ================= */}
        {isLoading && !fetchError && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[#EDEDED] shadow-sm animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= STATE 3: EMPTY STATE ================= */}
        {!isLoading && !fetchError && products.length === 0 && (
          <div className="mt-12 bg-white rounded-3xl p-8 sm:p-14 border border-[#EDEDED] shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F9F0] text-[#009B5B] flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 stroke-[2]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Belum Ada Produk yang Dihitung
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
              Mulai masukkan produk daganganmu beserta resep bahan bakunya. UntungJelas akan otomatis menghitung modal per porsi dan status margin keuntungannya.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="inline-flex items-center gap-2 bg-[#009B5B] hover:bg-[#00854d] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full shadow-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Hitung Produk Pertamamu</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STATE 4: PRODUK BERHASIL DIMUAT ================= */}
        {!isLoading && !fetchError && products.length > 0 && (
          <div className="mt-8 space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Produk</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 block">{products.length} Item</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Produk Sehat</span>
                <span className="text-xl sm:text-2xl font-bold text-[#009B5B] mt-1 block">
                  {products.filter((p) => p.status === 'sehat').length} Item
                </span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Margin Tipis</span>
                <span className="text-xl sm:text-2xl font-bold text-[#D97706] mt-1 block">
                  {products.filter((p) => p.status === 'tipis').length} Item
                </span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-[#EDEDED] shadow-sm">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Perlu Evaluasi (Rugi)</span>
                <span className="text-xl sm:text-2xl font-bold text-[#DC2626] mt-1 block">
                  {products.filter((p) => p.status === 'rugi').length} Item
                </span>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((item) => {
                const untungPerPorsi = (item.selling_price || 0) - (item.modal_per_unit || 0)
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EDEDED] shadow-[0_3px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Nama & Status Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                          {item.name}
                        </h3>
                        {renderStatusBadge(item.status, item.margin_percent)}
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        Hasil Resep: <span className="font-semibold text-gray-800">{item.yield_qty || 1} Porsi</span>
                      </div>

                      {/* Bahan Baku Breakdown */}
                      <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100 mb-4">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Daftar Bahan Baku</span>
                          <span>{item.ingredients?.length || 0} Bahan</span>
                        </div>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {item.ingredients && item.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700 truncate max-w-[160px]">{ing.name}</span>
                              <span className="font-medium text-gray-900">{formatRupiah(ing.price)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-900">
                          <span>Total Biaya Resep</span>
                          <span>{formatRupiah(item.total_modal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="pt-3 border-t border-[#EDEDED] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Modal per Unit (HPP):</span>
                        <span className="font-bold text-gray-900">{formatRupiah(item.modal_per_unit)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Harga Jual:</span>
                        <span className="font-bold text-gray-900">{formatRupiah(item.selling_price)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-dashed border-gray-200">
                        <span className="text-gray-700">Untung Bersih / Porsi:</span>
                        <span className={untungPerPorsi >= 0 ? 'text-[#009B5B]' : 'text-red-600'}>
                          {untungPerPorsi >= 0 ? '+' : ''}{formatRupiah(untungPerPorsi)}
                        </span>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

          </div>
        )}

      </main>

      {/* ================= MODAL TAMBAH PRODUK BARU ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EDEDED] relative my-auto animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#E6F9F0] text-[#009B5B] flex items-center justify-center">
                  <Calculator className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Kalkulator HPP Produk Baru
                  </h2>
                  <p className="text-xs text-gray-500">
                    Masukkan bahan baku untuk menghitung modal per porsi secara akurat.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Error & Success Feedback */}
            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitProduct} className="mt-4 space-y-4">
              
              {/* Row 1: Nama Produk & Porsi Resep */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Nama Produk<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Brownies Panggang Mini"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Hasil Porsi (Yield)<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={yieldQty}
                    onChange={(e) => setYieldQty(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B]"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Harga Jual */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  Harga Jual per Porsi (Rp)<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="Contoh: 15000"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B]"
                  required
                />
              </div>

              {/* Dynamic Ingredients Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Daftar Bahan Baku Resep
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#009B5B] hover:text-[#00854d]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris Bahan</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                          placeholder={`Bahan ke-${idx + 1} (cth: Tepung Terigu 250gr)`}
                          className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B]"
                          required
                        />
                      </div>
                      <div className="w-32 sm:w-36">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={ing.price}
                          onChange={(e) => handleIngredientChange(idx, 'price', e.target.value)}
                          placeholder="Biaya (Rp)"
                          className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B]"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        disabled={ingredients.length <= 1}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Hapus Bahan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-[#E2E2E2]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Estimasi Langsung (Preview)
                  </span>
                  {renderStatusBadge(livePreview.status, livePreview.marginPercent)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-medium">Total Bahan</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {formatRupiah(livePreview.totalIngredientsCost)}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-medium">Modal / Porsi</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {formatRupiah(livePreview.modalPerUnit)}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-medium">Untung / Porsi</span>
                    <span className={`text-xs sm:text-sm font-bold ${
                      livePreview.profitPerUnit >= 0 ? 'text-[#009B5B]' : 'text-red-600'
                    }`}>
                      {formatRupiah(livePreview.profitPerUnit)}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 block font-medium">Margin Keuntungan</span>
                    <span className={`text-xs sm:text-sm font-bold ${
                      livePreview.status === 'sehat'
                        ? 'text-[#009B5B]'
                        : livePreview.status === 'tipis'
                        ? 'text-[#D97706]'
                        : 'text-red-600'
                    }`}>
                      {livePreview.marginPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#009B5B] hover:bg-[#00854d] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Server...</span>
                    </>
                  ) : (
                    <span>Simpan & Hitung HPP</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}

