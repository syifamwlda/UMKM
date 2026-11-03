import React, { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Features from './components/Features'
import AiAssistant from './components/AiAssistant'
import Faq from './components/Faq'
import CtaBanner from './components/CtaBanner'
import Footer from './components/Footer'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ProductHppPage from './components/ProductHppPage'

function MainContent() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash
    if (hash === '#login') return 'login'
    if (hash === '#daftar' || hash === '#register') return 'register'
    if (hash === '#produk' || hash === '#dashboard') return 'produk'
    return 'home'
  })

  // Synchronize hash in URL with page state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#login') {
        setCurrentPage('login')
      } else if (hash === '#daftar' || hash === '#register') {
        setCurrentPage('register')
      } else if (hash === '#produk' || hash === '#dashboard') {
        setCurrentPage('produk')
      } else {
        setCurrentPage('home')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateTo = (page, targetId) => {
    if (page === 'login') {
      setCurrentPage('login')
      window.location.hash = '#login'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'register') {
      setCurrentPage('register')
      window.location.hash = '#daftar'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (page === 'produk') {
      setCurrentPage('produk')
      window.location.hash = '#produk'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setCurrentPage('home')
      window.location.hash = targetId ? `#${targetId}` : '#'
      if (!targetId || targetId === 'beranda') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  // Layar 1: Login
  if (currentPage === 'login') {
    return (
      <LoginPage
        onNavigateHome={() => navigateTo('home')}
        onNavigateRegister={() => navigateTo('register')}
        onSuccessLogin={() => navigateTo('produk')}
      />
    )
  }

  // Layar 2: Register
  if (currentPage === 'register') {
    return (
      <RegisterPage
        onNavigateHome={() => navigateTo('home')}
        onNavigateLogin={() => navigateTo('login')}
        onSuccessRegister={() => navigateTo('produk')}
      />
    )
  }

  // Layar 3: Hitung Modal Produk (Protected)
  if (currentPage === 'produk') {
    return (
      <ProtectedRoute onNavigateLogin={() => navigateTo('login')}>
        <ProductHppPage onNavigateHome={() => navigateTo('home')} />
      </ProtectedRoute>
    )
  }

  // Layar 4: Landing Page Utama
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <Navbar
        onNavigateLogin={() => navigateTo('login')}
        onNavigateRegister={() => navigateTo('register')}
      />
      <main>
        {/* Beranda Section: Hero + Stats */}
        <div id="beranda" className="scroll-mt-16 lg:scroll-mt-20 lg:min-h-[calc(100vh-3rem)] flex flex-col justify-start">
          <Hero />
          <Stats />
        </div>
        <Features />
        <AiAssistant />
        <Faq />
        <CtaBanner />
      </main>
      <Footer
        onNavigateLogin={() => navigateTo('login')}
        onNavigateRegister={() => navigateTo('register')}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  )
}
