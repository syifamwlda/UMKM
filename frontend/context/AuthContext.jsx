import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sanctum_token') || null)
  const [user, setUser] = useState(() => {
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

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
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

