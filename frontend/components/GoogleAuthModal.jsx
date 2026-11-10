import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function GoogleAuthModal({ isOpen, onClose, onSuccess, mode = 'login' }) {
  const { loginWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmail, setCustomEmail] = useState('')

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  // Initialize official Google Identity Services if client ID is configured
  useEffect(() => {
    if (!isOpen || !googleClientId) return

    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        initGoogleGsi()
        return
      }

      const existingScript = document.getElementById('google-gsi-client')
      if (!existingScript) {
        const script = document.createElement('script')
        script.id = 'google-gsi-client'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => initGoogleGsi()
        document.body.appendChild(script)
      }
    }

    const initGoogleGsi = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              await handleAuthenticate({ credential: response.credential })
            }
          },
        })

        const btnContainer = document.getElementById('gsi-official-button')
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: mode === 'register' ? 'signup_with' : 'signin_with',
            shape: 'pill',
          })
        }
      } catch (e) {
        console.warn('GSI Init warning:', e)
      }
    }

    loadGoogleScript()
  }, [isOpen, googleClientId, mode])

  if (!isOpen) return null

  const handleAuthenticate = async (payload) => {
    setLoading(true)
    setError('')
    try {
      await loginWithGoogle(payload)
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.hash = '#dashboard'
      }
      onClose()
    } catch (err) {
      console.error('Google Auth Error:', err)
      const msg = err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null) ||
        'Gagal melakukan autentikasi dengan Google. Silakan coba lagi.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSample = (sample) => {
    handleAuthenticate({
      google_id: sample.sub,
      name: sample.name,
      email: sample.email,
      avatar: sample.avatar,
    })
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (!customEmail || !customEmail.includes('@')) {
      setError('Masukkan alamat email Google yang valid.')
      return
    }

    const derivedName = customName.trim() || customEmail.split('@')[0]
    handleAuthenticate({
      google_id: `google_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`,
      name: derivedName,
      email: customEmail.trim(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=009B5B`,
    })
  }

  const sampleAccounts = [
    {
      sub: 'google_user_10101',
      name: 'Sultan',
      email: 'sultan@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    },
    {
      sub: 'google_user_10102',
      name: 'Budi Pratama',
      email: 'budi.pratama@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
  ]

  const modalContent = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md p-6 shadow-2xl border border-gray-100 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {mode === 'register' ? 'Daftar dengan Google' : 'Masuk dengan Google'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Lanjutkan ke aplikasi <strong className="text-gray-800 font-semibold">UntungJelas</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="py-8 text-center space-y-2.5">
            <Loader2 className="w-8 h-8 text-[#009B5B] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-700">
              Menghubungkan akun Google ke UntungJelas...
            </p>
            <p className="text-[11px] text-gray-400">
              Mohon tunggu beberapa saat.
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* If Google Client ID is configured, show official GSI container */}
            {googleClientId && (
              <div className="mb-4">
                <div id="gsi-official-button" className="w-full flex justify-center"></div>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center text-[11px] text-gray-400">
                    <span className="bg-white px-2">atau pilih akun instan</span>
                  </div>
                </div>
              </div>
            )}

            {/* List of Accounts */}
            {!isCustomMode ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Pilih Akun Google:
                </p>

                {sampleAccounts.map((sample) => (
                  <button
                    key={sample.sub}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="w-full p-3 rounded-2xl border border-gray-200/80 hover:border-[#009B5B] hover:bg-emerald-50/30 flex items-center gap-3 transition-all cursor-pointer text-left group"
                  >
                    <img
                      src={sample.avatar}
                      alt={sample.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-[#009B5B]/50 transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#009B5B] transition-colors truncate">
                        {sample.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{sample.email}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-transparent group-hover:text-[#009B5B] transition-colors" />
                  </button>
                ))}

                {/* Gunakan Akun Lain */}
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="w-full p-3 rounded-2xl border border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50/70 flex items-center gap-3 transition-all cursor-pointer text-left text-xs font-semibold text-gray-700 mt-2"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-[13px] font-bold text-gray-800">
                      Gunakan Akun Google Lain
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Masukkan email Google Anda sendiri
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              /* Custom Google Account Form */
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-800">
                    Masukkan Akun Google Anda:
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="text-[11px] font-semibold text-[#009B5B] hover:underline cursor-pointer"
                  >
                    Kembali ke daftar
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009B5B]/20 focus:border-[#009B5B] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Email Google (@gmail.com)
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="namaanda@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-[13px] text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009B5B]/20 focus:border-[#009B5B] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#009B5B] hover:bg-[#00854d] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
                >
                  Lanjutkan dengan Akun Ini
                </button>
              </form>
            )}

            {/* Footer privacy notice */}
            <p className="text-[10px] text-gray-400 text-center mt-5 leading-relaxed">
              Dengan melanjutkan, Google akan membagikan nama, alamat email, dan foto profil Anda kepada UntungJelas sesuai Kebijakan Privasi.
            </p>
          </>
        )}
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}
