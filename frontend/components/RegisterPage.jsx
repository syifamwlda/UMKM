import React, { useState } from 'react'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function RegisterPage({ onNavigateHome, onNavigateLogin, onRegisterSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isShaking, setIsShaking] = useState(false)

  const validate = () => {
    const newErrors = {}
    let isValid = true

    if (!name.trim()) {
      newErrors.name = 'Harap isi nama lengkap anda.'
      isValid = false
    }

    if (!email.trim()) {
      newErrors.email = 'Harap isi email atau nomor telepon kamu.'
      isValid = false
    } else if (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Format email tidak valid (contoh: nama@email.com).'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Harap isi kata sandi kamu.'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter.'
      isValid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Harap konfirmasi kata sandi kamu.'
      isValid = false
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Kata sandi konfirmasi tidak cocok.'
      isValid = false
    }

    if (!agreed) {
      newErrors.agreed = 'Kamu harus menyetujui Ketentuan & Kebijakan Privasi.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      if (onRegisterSuccess) {
        onRegisterSuccess()
      } else {
        onNavigateHome()
      }
    }, 600)
  }

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true)
    setTimeout(() => {
      setIsGoogleLoading(false)
      if (onRegisterSuccess) {
        onRegisterSuccess()
      } else {
        onNavigateHome()
      }
    }, 600)
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full bg-white flex flex-col font-sans antialiased text-gray-900 relative selection:bg-[#009B5B]/15">
      
      {/* Decorative Money Illustration Background (Bottom-left & Top-right) */}
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
      <main className="flex-1 min-h-0 flex items-center justify-center px-4 py-2 sm:py-4 relative z-10">
        <div className="w-full max-w-[430px] sm:max-w-[440px] bg-white/95 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-5 sm:p-0 rounded-[24px] sm:rounded-none border border-gray-100 sm:border-transparent shadow-lg sm:shadow-none animate-fade-in-up">
          
          {/* Header Title & Subtitle */}
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Mulai Perjalanan Bisnismu!
            </h1>
            <p className="mt-1 text-[11px] sm:text-xs text-gray-500">
              Buat akun dan mulai kelola keuntungan usahamu.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-2.5 sm:space-y-3">
            
            {/* Field: Nama Lengkap */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                Nama Lengkap<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                }}
                placeholder="Masukkan nama lengkap anda"
                className={`w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-[13px] rounded-xl border ${
                  errors.name
                    ? `border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10 ${isShaking ? 'animate-shake' : ''}`
                    : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 animate-fade-in-up font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Field: Email / Nomor Telepon */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                Email/Nomor Telepon<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                }}
                placeholder="Masukkan alamat email kamu disini"
                className={`w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-[13px] rounded-xl border ${
                  errors.email
                    ? `border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10 ${isShaking ? 'animate-shake' : ''}`
                    : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 animate-fade-in-up font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Field: Kata Sandi */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                Kata Sandi<span className="text-red-500">*</span>
              </label>
              <div className={`relative ${errors.password && isShaking ? 'animate-shake' : ''}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                  }}
                  placeholder="Masukkan kata sandi kamu disini"
                  className={`w-full px-3.5 py-2 sm:py-2.5 pr-9 text-xs sm:text-[13px] rounded-xl border ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10'
                      : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                  } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 animate-fade-in-up font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Field: Konfirmasi Kata Sandi */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-gray-800 mb-1">
                Konfirmasi Kata Sandi<span className="text-red-500">*</span>
              </label>
              <div className={`relative ${errors.confirmPassword && isShaking ? 'animate-shake' : ''}`}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                  }}
                  placeholder="Konfirmasi kata sandi kamu"
                  className={`w-full px-3.5 py-2 sm:py-2.5 pr-9 text-xs sm:text-[13px] rounded-xl border ${
                    errors.confirmPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 bg-red-50/10'
                      : 'border-gray-200 focus:border-[#009B5B] focus:ring-2 focus:ring-[#009B5B]/20 bg-white'
                  } placeholder-gray-400 text-gray-900 focus:outline-none transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 animate-fade-in-up font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Checkbox: Ketentuan & Kebijakan Privasi */}
            <div className="pt-0.5">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked)
                    if (errors.agreed) setErrors((prev) => ({ ...prev, agreed: '' }))
                  }}
                  className="mt-0.5 w-3.5 h-3.5 rounded text-[#009B5B] focus:ring-[#009B5B] border-gray-300 accent-[#009B5B] cursor-pointer"
                />
                <span className="text-[11px] sm:text-xs text-gray-700 leading-snug">
                  Saya setuju dengan{' '}
                  <a
                    href="#ketentuan"
                    onClick={(e) => e.preventDefault()}
                    className="text-[#0066CC] hover:underline font-medium"
                  >
                    Ketentuan & Kebijakan Privasi
                  </a>
                </span>
              </label>
              {errors.agreed && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 animate-fade-in-up font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errors.agreed}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 sm:py-3 bg-[#009B5B] hover:bg-[#00854d] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-85 disabled:cursor-not-allowed mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          {/* Divider "Atau" */}
          <div className="relative my-3 sm:my-3.5 flex items-center justify-center">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-2.5 text-[10px] sm:text-[11px] font-medium text-gray-400 absolute">
              Atau
            </span>
          </div>

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2 sm:py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-[13px] font-medium text-gray-700 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-75"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                <span>Menghubungkan Akun Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          {/* Already have an account */}
          <p className="text-center text-[11px] sm:text-xs text-gray-600 mt-3 sm:mt-4">
            Sudah memiliki akun?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-[#0066CC] font-semibold hover:underline cursor-pointer"
            >
              Masuk disini
            </button>
          </p>

        </div>
      </main>

    </div>
  )
}
