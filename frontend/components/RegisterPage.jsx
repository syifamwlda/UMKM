import React, { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const BUSINESS_TYPES = [
  'Kuliner & Minuman',
  'Retail & Toko Kelontong',
  'Fashion & Pakaian',
  'Jasa & Servis',
  'Kriya & Kerajinan',
  'Pertanian & Peternakan',
  'Kesehatan & Kecantikan',
  'Usaha Lainnya',
]

export default function RegisterPage({ onNavigateHome, onNavigateLogin, onSuccessRegister }) {
  const [step, setStep] = useState(1)

  // Step 1: Data Akun
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 2: Profil Usaha
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('Kuliner & Minuman')

  // Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { register } = useAuth()

  // Validasi Step 1 sebelum lanjut ke Step 2
  const handleNextStep = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!name.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.')
      return
    }
    if (!phone.trim()) {
      setErrorMessage('Nomor telepon wajib diisi.')
      return
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.')
      return
    }
    if (password !== passwordConfirmation) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setStep(2)
  }

  // Submit Final Step 2
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!businessName.trim()) {
      setErrorMessage('Nama usaha wajib diisi.')
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        business_name: businessName.trim(),
        business_type: businessType,
        password,
        password_confirmation: passwordConfirmation,
      }

      const res = await register(payload)
      setSuccessMessage(res.message || 'Pendaftaran berhasil! Mengalihkan ke dashboard...')

      setTimeout(() => {
        if (onSuccessRegister) {
          onSuccessRegister()
        } else {
          window.location.hash = '#produk'
        }
      }, 700)
    } catch (err) {
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0]
        setErrorMessage(err.response.data.errors[firstKey][0])
      } else if (err.code === 'ERR_NETWORK') {
        setErrorMessage('Gagal terhubung ke server backend. Pastikan server aktif.')
      } else {
        setErrorMessage('Terjadi kesalahan saat pendaftaran. Silakan periksa kembali data Anda.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full bg-[#F8F9FA] flex flex-col font-sans antialiased text-gray-900 relative">
      
      {/* Top Back Link */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-30">
        <button
          type="button"
          onClick={step === 2 ? () => setStep(1) : onNavigateHome}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{step === 2 ? 'Kembali ke Langkah 1' : 'Kembali ke Beranda'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] min-h-screen lg:h-screen w-full">
        
        {/* ================= LEFT COLUMN: REGISTER CARD ================= */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 lg:p-8 relative min-h-screen lg:min-h-0 lg:h-full lg:overflow-y-auto z-10 w-full">
          
          {/* White Register Card */}
          <div className="w-full max-w-[460px] bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.06)] border border-[#EDEDED] relative z-20 my-auto">
            
            {/* Brand Logo Lockup */}
            <div className="flex justify-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigateHome()
                }}
                className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
              >
                <img
                  src="/assets/Icons/logo.png"
                  alt="UntungJelas Logo"
                  className="h-8 sm:h-9 w-auto object-contain flex-shrink-0 transition-transform group-hover:scale-105"
                />
                <span className="text-xl sm:text-[22px] font-semibold tracking-tight text-gray-900 leading-none">
                  Untung<span className="text-[#259A66]">Jelas</span>
                </span>
              </a>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mt-5">
              <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                Daftar Akun Baru
              </h1>
              <p className="mt-1.5 text-xs sm:text-[13px] text-gray-500 leading-relaxed max-w-[320px] mx-auto">
                Mulai hitung modal sebenarnya dan pantau untung tokomu secara cerdas.
              </p>
            </div>

            {/* Step Indicators (Bertahap) */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  step === 1
                    ? 'bg-[#E6F9F0] text-[#009B5B] border border-[#A7F3D0]'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-[#009B5B] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Data Pemilik</span>
              </div>

              <div className="w-5 h-[1.5px] bg-gray-200"></div>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  step === 2
                    ? 'bg-[#E6F9F0] text-[#009B5B] border border-[#A7F3D0]'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-[#009B5B] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </span>
                <span>Profil Usaha</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* ================= STEP 1 FORM ================= */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="mt-5 space-y-3.5">
                {/* Field: Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Nama Pemilik Usaha<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all"
                    required
                  />
                </div>

                {/* Field: Nomor HP */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Nomor WhatsApp / HP<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all"
                    required
                  />
                </div>

                {/* Field: Kata Sandi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Kata Sandi<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field: Konfirmasi Kata Sandi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Ulangi Kata Sandi<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Ketik ulang kata sandi"
                      className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Next Step Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#009B5B] hover:bg-[#00854d] text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-[0.99] mt-3 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Lanjut ke Profil Usaha</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            )}

            {/* ================= STEP 2 FORM ================= */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Field: Nama Usaha */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Nama Usaha / Toko<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Kopi Senja Bahagia"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all"
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Nama ini akan dicetak pada struk digital untuk pelanggan.
                  </p>
                </div>

                {/* Field: Jenis Usaha */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Kategori / Bidang Usaha<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all"
                  >
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Summary Box */}
                <div className="p-3 bg-[#E6F9F0] rounded-xl border border-[#A7F3D0] text-xs text-[#065F46] space-y-1">
                  <div className="font-semibold">Ringkasan Pendaftaran:</div>
                  <div>• Pemilik: <span className="font-medium text-gray-900">{name}</span> ({phone})</div>
                  <div>• Usaha: <span className="font-medium text-gray-900">{businessName || '-'}</span></div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm transition-all"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 py-3.5 bg-[#009B5B] hover:bg-[#00854d] text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan...</span>
                      </>
                    ) : (
                      <span>Daftar Sekarang</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Login Note */}
            <p className="text-center text-[11px] sm:text-xs text-gray-600 mt-6">
              Sudah Punya Akun?{' '}
              <button
                type="button"
                onClick={() => {
                  if (onNavigateLogin) {
                    onNavigateLogin()
                  } else {
                    window.location.hash = '#login'
                  }
                }}
                className="text-[#0066CC] font-semibold hover:underline cursor-pointer"
              >
                Masuk Disini!
              </button>
            </p>

          </div>

        </div>

        {/* ================= RIGHT COLUMN: HERO BANNER (DESKTOP ONLY) ================= */}
        <div className="hidden lg:flex items-end justify-end relative lg:w-auto lg:h-full lg:min-h-0 select-none pointer-events-none overflow-hidden">
          <img
            src="/assets/Pictures/login-hero-banner.png"
            alt="UntungJelas - Pahami Bisnismu, Maksimalkan Keuntunganmu"
            className="h-full w-auto max-h-screen object-contain object-right-bottom"
          />
        </div>

      </div>

    </div>
  )
}

