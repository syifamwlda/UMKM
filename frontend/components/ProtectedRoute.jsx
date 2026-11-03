import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, onNavigateLogin }) {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (onNavigateLogin) {
        onNavigateLogin()
      } else {
        window.location.hash = '#login'
      }
    }
  }, [isLoading, isAuthenticated, onNavigateLogin])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#009B5B] animate-spin" />
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            Memuat data akun...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}

