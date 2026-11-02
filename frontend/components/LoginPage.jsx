import React, { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function LoginPage({ onNavigateHome }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden w-full bg-[#F8F9FA] flex flex-col font-sans antialiased text-gray-900">
      
      {/* Top Floating Back Button for Quick Navigation */}
      <div className="absolute top-5 left-5 z-30">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:bg-white hover:text-gray-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] min-h-screen lg:h-screen w-full">
        
        {/* ================= LEFT COLUMN: LOGIN CARD ================= */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-8 order-2 lg:order-1 relative lg:h-full lg:overflow-y-auto z-10">
          
          {/* White Login Card */}
          <div className="w-full max-w-[430px] bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.06)] border border-[#EDEDED] relative z-20">
            
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
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              
              {/* Field: Email / Nomor Telepon */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Email/Nomor Telepon<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan alamat email kamu disini"
                  className="w-full px-4 py-3 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all"
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
                    placeholder="Masukkan kata sandi kamu disini"
                    className="w-full px-4 py-3 pr-10 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all"
                    required
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

              {/* Success Notification simulation */}
              {submitted && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
                  Selamat datang kembali! Mengalihkan ke dashboard...
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#009B5B] hover:bg-[#00854d] text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Divider "Atau" */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-medium text-gray-400 absolute">
                Atau
              </span>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="w-full py-3 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-[13px] font-medium text-gray-700 flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer"
            >
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
            </button>

            {/* Register Note */}
            <p className="text-center text-[11px] sm:text-xs text-gray-600 mt-6">
              Belum Punya Akun?{' '}
              <a
                href="#daftar"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigateHome()
                }}
                className="text-[#0066CC] font-semibold hover:underline"
              >
                Daftar Disini!
              </a>
            </p>

          </div>

        </div>

        {/* ================= RIGHT COLUMN: HERO BANNER (SINGLE COMPOSITE IMAGE) ================= */}
        <div className="order-1 lg:order-2 flex items-end justify-end relative w-full lg:w-auto h-[360px] sm:h-[440px] lg:h-full lg:min-h-0 select-none pointer-events-none overflow-hidden">
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

