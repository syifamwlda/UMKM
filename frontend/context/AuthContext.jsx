import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

// Helper untuk mengekstrak token & profil dari callback Google OAuth di hash URL
const parseOAuthCallback = () => {
  try {
    const hash = window.location.hash
    if (hash.startsWith('#google-callback')) {
      const queryStr = hash.includes('?') ? hash.split('?')[1] : ''
      const params = new URLSearchParams(queryStr)
      const oauthToken = params.get('token')
      const rawUser = params.get('user')
      if (oauthToken && rawUser) {
        const decoded = JSON.parse(atob(decodeURIComponent(rawUser)))
        return { token: oauthToken, user: decoded }
      }
    }
  } catch (e) {
    console.error('Failed to parse OAuth callback:', e)
  }
  return null
}

const initialOAuth = parseOAuthCallback()
if (initialOAuth) {
  localStorage.setItem('sanctum_token', initialOAuth.token)
  localStorage.setItem('auth_user', JSON.stringify(initialOAuth.user))
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => initialOAuth?.token || localStorage.getItem('sanctum_token') || null)
  const [user, setUser] = useState(() => {
    if (initialOAuth?.user) return initialOAuth.user
    try {
      const saved = localStorage.getItem('auth_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  // Sinkronisasi status autentikasi awal & verifikasi token ke backend jika ada
  useEffect(() => {
    let isMounted = true

    if (window.location.hash.startsWith('#google-callback')) {
      window.history.replaceState(null, '', window.location.pathname + '#dashboard')
      window.location.hash = '#dashboard'
    }

    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('sanctum_token')
      if (!storedToken) {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        const response = await api.get('/me')
        if (isMounted && response.data?.data) {
          const freshUser = response.data.data
          setUser(freshUser)
          localStorage.setItem('auth_user', JSON.stringify(freshUser))
        }
      } catch (err) {
        // Jika token invalid/expired, interceptor 401 akan menangani atau kita bersihkan di sini
        if (err.response?.status === 401) {
          localStorage.removeItem('sanctum_token')
          localStorage.removeItem('auth_user')
          if (isMounted) {
            setToken(null)
            setUser(null)
          }
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    verifyAuth()

    // Listener ketika interceptor axios menangkap 401
    const handleUnauthorized = () => {
      setToken(null)
      setUser(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      isMounted = false
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = async (phone, password) => {
    const response = await api.post('/login', { phone, password })
    const payload = response.data?.data
    if (payload?.token && payload?.user) {
      localStorage.setItem('sanctum_token', payload.token)
      localStorage.setItem('auth_user', JSON.stringify(payload.user))
      setToken(payload.token)
      setUser(payload.user)
    }
    return response.data
  }

  const register = async (userData) => {
    const response = await api.post('/register', userData)
    const payload = response.data?.data
    if (payload?.token && payload?.user) {
      localStorage.setItem('sanctum_token', payload.token)
      localStorage.setItem('auth_user', JSON.stringify(payload.user))
      setToken(payload.token)
      setUser(payload.user)
    }
    return response.data
  }

  const loginWithGoogle = async (googleData) => {
    const response = await api.post('/auth/google', googleData)
    const payload = response.data?.data
    if (payload?.token && payload?.user) {
      localStorage.setItem('sanctum_token', payload.token)
      localStorage.setItem('auth_user', JSON.stringify(payload.user))
      setToken(payload.token)
      setUser(payload.user)
    }
    return response.data
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {
      // Abaikan jika network gagal saat logout, tetap hapus sesi lokal
    } finally {
      localStorage.removeItem('sanctum_token')
      localStorage.removeItem('auth_user')
      setToken(null)
      setUser(null)
    }
  }

  // Perbarui data user di state dan localStorage setelah update profil berhasil
  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData }
    setUser(merged)
    localStorage.setItem('auth_user', JSON.stringify(merged))
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

