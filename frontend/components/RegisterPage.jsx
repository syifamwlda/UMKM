import React, { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, Loader2, AlertCircle, ChevronDown, Check } from 'lucide-react'
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

export default function RegisterPage({ onNavigateHome, onNavigateLogin, onRegisterSuccess, onSuccessRegister }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('Kuliner & Minuman')
  const [isBusinessTypeOpen, setIsBusinessTypeOpen] = useState(false)
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false)
  const businessTypeRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (businessTypeRef.current && !businessTypeRef.current.contains(e.target)) {
        setIsBusinessTypeOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsBusinessTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Tangkap pesan error jika dialihkan kembali dari Google OAuth
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('?')) {
      const queryStr = hash.split('?')[1]
      const params = new URLSearchParams(queryStr)
      const errorMsg = params.get('error')
      if (errorMsg) {
        setApiError(decodeURIComponent(errorMsg))
        window.history.replaceState(null, '', window.location.pathname + '#daftar')
      }
    }
  }, [])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  const { register } = useAuth()

  const validate = () => {
    const newErrors = {}
    let isValid = true

    if (!name.trim()) {
      newErrors.name = 'Harap isi nama lengkap Anda.'
      isValid = false
    }

    if (!phone.trim()) {
      newErrors.phone = 'Harap isi nomor telepon atau WhatsApp Anda.'
      isValid = false
    }

    if (!businessName.trim()) {
      newErrors.businessName = 'Harap isi nama toko atau usaha Anda.'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Harap isi kata sandi Anda.'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter.'
      isValid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Harap konfirmasi kata sandi Anda.'
      isValid = false
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Kata sandi konfirmasi tidak cocok.'
      isValid = false
    }

    if (!agreed) {
      newErrors.agreed = 'Anda harus menyetujui Ketentuan & Kebijakan Privasi.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validate()) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        business_name: businessName.trim(),
        business_type: businessType,
        password,
        password_confirmation: confirmPassword,
      }

      await register(payload)

      const callback = onRegisterSuccess || onSuccessRegister
      if (callback) {
        callback()
      } else {
        window.location.hash = '#dashboard'
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setApiError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0]
        setApiError(err.response.data.errors[firstKey][0])
      } else if (err.code === 'ERR_NETWORK') {
        setApiError('Gagal terhubung ke server backend. Pastikan server aktif.')
      } else {
        setApiError('Terjadi kesalahan saat pendaftaran. Silakan periksa kembali data Anda.')
      }
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setIsGoogleRedirecting(true)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
    window.location.href = `${backendUrl}/api/auth/google/redirect?from=register`
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full bg-white flex flex-col font-sans antialiased text-gray-900 relative selection:bg-[#009B5B]/15">
      
      {/* Decorative Money Illustration Background */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/assets/Pictures/register-money-bg.png"
          alt=""
          className="w-full h-full object-cover object-center opacity-85 sm:opacity-95"
        />
      </div>

      {/* ================= TOP NAVBAR ================= */}
      <header className="sticky top-0 z-40 w-full flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-md rounded-b-2xl shadow-[0px_3px_4px_rgba(0,0,0,0.05)] border border-[#E6E6E6] px-5 sm:px-8 h-16 sm:h-[68px] flex items-center justify-between">
            
            {/* Left: Brand Logo */}
            <a
              href="#beranda"
              onClick={(e) => {
                e.preventDefault()
                onNavigateHome()
              }}
              className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer select-none group"
            >
              <img
                src="/assets/Icons/logo.png"
                alt="UntungJelas Logo"
                className="h-7 sm:h-8 w-auto object-contain flex-shrink-0 transition-transform group-hover:scale-105"
              />
              <span className="text-lg sm:text-[20px] font-semibold tracking-tight text-gray-900 leading-none">
                Untung<span className="text-[#259A66]">Jelas</span>
              </span>
            </a>

            {/* Right: Hubungi Kami Button */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateHome) onNavigateHome('footer')
              }}
              className="inline-flex items-center justify-center bg-[#009B5B] hover:bg-[#00874e] text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
            >
              Hubungi Kami
            </button>

          </div>
        </div>
      </header>

      {/* ================= MAIN REGISTER FORM ================= */}
      <main className="flex-1 min-h-0 flex items-center justify-center px-4 py-3 sm:py-5 relative z-10 overflow-y-auto">
        <div className="w-full max-w-[480px] bg-white/95 sm:bg-white backdrop-blur-md p-6 sm:p-7 rounded-[28px] border border-gray-200/80 shadow-xl my-auto animate-fade-in-up">
          
          {/* Header Title & Subtitle */}
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Mulai Perjalanan Bisnismu!
            </h1>
            <p className="mt-1 text-[11px] sm:text-xs text-gray-500">
              Buat akun dan mulai kelola modal & keuntungan usahamu secara cerdas.
            </p>
          </div>

          {/* Backend Error Alert */}
          {apiError && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-2.5 sm:space-y-3">
            
            {/* Field: Nama Lengkap */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                Nama Lengkap Pemilik<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                }}
                placeholder="Contoh: Budi Santoso"
                className={`w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border ${
                  errors.name
                    ? `border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10 ${isShaking ? 'animate-shake' : ''}`
                    : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Field: Nomor HP / WhatsApp */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                Nomor Telepon / WhatsApp<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
                }}
                placeholder="Contoh: 081234567890"
                className={`w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border ${
                  errors.phone
                    ? `border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10 ${isShaking ? 'animate-shake' : ''}`
                    : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>

            {/* Field: Nama Usaha & Jenis Usaha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                  Nama Usaha / Toko<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value)
                    if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: '' }))
                  }}
                  placeholder="Contoh: Kopi Senja"
                  className={`w-full px-3 py-2 text-xs rounded-xl border ${
                    errors.businessName
                      ? 'border-red-400 bg-red-50/10'
                      : 'border-gray-200 focus:border-[#009B5B] bg-white'
                  } placeholder-gray-400 text-gray-900 focus:outline-none`}
                />
              </div>

              <div className="relative" ref={businessTypeRef}>
                <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                  Kategori Usaha<span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsBusinessTypeOpen(!isBusinessTypeOpen)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border flex items-center justify-between text-left transition-all duration-150 bg-white cursor-pointer select-none ${
                    isBusinessTypeOpen
                      ? 'border-[#009B5B] ring-2 ring-[#009B5B]/15 text-gray-900 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-900'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={isBusinessTypeOpen}
                >
                  <span className="truncate font-medium">{businessType}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                      isBusinessTypeOpen ? 'rotate-180 text-[#009B5B]' : ''
                    }`}
                  />
                </button>

                {isBusinessTypeOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-50 max-h-56 overflow-y-auto animate-fade-in"
                    role="listbox"
                  >
                    {BUSINESS_TYPES.map((type) => {
                      const isSelected = businessType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setBusinessType(type);
                            setIsBusinessTypeOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#EBF8F2] text-[#009B5B] font-semibold'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <span className="truncate">{type}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#009B5B] shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Field: Kata Sandi */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                Kata Sandi<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                  }}
                  placeholder="Minimal 6 karakter"
                  className={`w-full px-3.5 py-2 pr-10 text-xs sm:text-[13px] rounded-xl border ${
                    errors.password
                      ? `border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10 ${isShaking ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                  } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Field: Konfirmasi Kata Sandi */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                Ulangi Kata Sandi<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                  }}
                  placeholder="Ulangi kata sandi Anda"
                  className={`w-full px-3.5 py-2 pr-10 text-xs sm:text-[13px] rounded-xl border ${
                    errors.confirmPassword
                      ? `border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10 ${isShaking ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                  } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Terms and Privacy Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked)
                    if (errors.agreed) setErrors((prev) => ({ ...prev, agreed: '' }))
                  }}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-[#009B5B] focus:ring-[#009B5B]"
                />
                <span className="text-[11px] text-gray-600 leading-tight">
                  Saya menyetujui{' '}
                  <span className="text-[#0066CC] font-medium hover:underline">Ketentuan Layanan</span>{' '}
                  & <span className="text-[#0066CC] font-medium hover:underline">Kebijakan Privasi</span>.
                </span>
              </label>
              {errors.agreed && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.agreed}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 bg-[#009B5B] hover:bg-[#00854d] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-85 disabled:cursor-not-allowed mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Divider "Atau" */}
          <div className="relative my-3 flex items-center justify-center">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-medium text-gray-400 absolute">
              Atau
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleRedirecting}
            className="w-full py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-75"
          >
            {isGoogleRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                <span>Menghubungkan ke Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Daftar dengan Google</span>
              </>
            )}
          </button>

          {/* Login Note */}
          <p className="text-center text-[11px] text-gray-600 mt-3">
            Sudah Punya Akun?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-[#0066CC] font-semibold hover:underline cursor-pointer"
            >
              Masuk Disini!
            </button>
          </p>

        </div>
      </main>

    </div>
  )
}
