import React, { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage({ onNavigateHome, onNavigateRegister, onLoginSuccess, onSuccessLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [apiError, setApiError] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  const { login } = useAuth()

  const validate = () => {
    const newErrors = { email: '', password: '' }
    let isValid = true

    if (!email.trim()) {
      newErrors.email = 'Harap isi email atau nomor telepon kamu.'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Harap isi kata sandi kamu.'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter.'
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
      await login(email.trim(), password)
      const callback = onLoginSuccess || onSuccessLogin
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
        setApiError('Nomor HP atau kata sandi tidak cocok. Silakan periksa kembali.')
      }
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
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
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] min-h-screen lg:h-screen w-full">
        
        {/* ================= LEFT COLUMN: LOGIN CARD ================= */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 lg:p-8 relative min-h-screen lg:min-h-0 lg:h-full lg:overflow-y-auto z-10 w-full">
          
          {/* White Login Card */}
          <div className="w-full max-w-[430px] bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.06)] border border-[#EDEDED] relative z-20 animate-fade-in-up">
            
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
            <div className="text-center mt-6">
              <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
                Masuk ke Akun
              </h1>
              <p className="mt-2 text-xs sm:text-[13px] text-gray-500 leading-relaxed max-w-[290px] mx-auto">
                Silakan masukkan data akun untuk mengakses buku kas tokomu.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
              
              {/* Backend Error Alert */}
              {apiError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{apiError}</span>
                </div>
              )}

              {/* Field: Email / Nomor Telepon */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Email/Nomor Telepon<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                  }}
                  placeholder="Masukkan nomor telepon atau email kamu"
                  className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl border ${
                    errors.email
                      ? `border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10 ${isShaking ? 'animate-shake' : ''}`
                      : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                  } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1 animate-fade-in-up font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
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
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                    }}
                    placeholder="Masukkan kata sandi kamu disini"
                    className={`w-full px-4 py-3 pr-10 text-xs sm:text-sm rounded-xl border ${
                      errors.password
                        ? `border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10 ${isShaking ? 'animate-shake' : ''}`
                        : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                    } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1 animate-fade-in-up font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}

                {/* Forgot Password */}
                <div className="flex justify-end mt-2">
                  <a
                    href="#lupa-sandi"
                    className="text-[11px] sm:text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                  >
                    Lupa Kata Sandi?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#009B5B] hover:bg-[#00854d] text-white font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-85 disabled:cursor-not-allowed mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            {/* Register Note */}
            <p className="text-center text-[11px] sm:text-xs text-gray-600 mt-6">
              Belum Punya Akun?{' '}
              <a
                href="#daftar"
                onClick={(e) => {
                  e.preventDefault()
                  if (onNavigateRegister) {
                    onNavigateRegister()
                  } else {
                    onNavigateHome()
                  }
                }}
                className="text-[#0066CC] font-semibold hover:underline cursor-pointer"
              >
                Daftar Disini!
              </a>
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
