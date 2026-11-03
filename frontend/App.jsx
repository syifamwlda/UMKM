import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Features from './components/Features'
import AiAssistant from './components/AiAssistant'
import Faq from './components/Faq'
import CtaBanner from './components/CtaBanner'
import Footer from './components/Footer'
import LoginPage from './components/LoginPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return window.location.hash === '#login' ? 'login' : 'home'
  })

  // Synchronize hash in URL with page state
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#login') {
        setCurrentPage('login')
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
    } else {
      setCurrentPage('home')
      window.location.hash = targetId ? `#${targetId}` : '#'
      if (!targetId || targetId === 'beranda') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  // If active page is login, show LoginPage
  if (currentPage === 'login') {
    return <LoginPage onNavigateHome={() => navigateTo('home')} />
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <Navbar onNavigateLogin={() => navigateTo('login')} />
      <main>
        {/* Beranda Section: Hero + Stats combined with full viewport framing on desktop */}
        <div id="beranda" className="scroll-mt-16 lg:scroll-mt-20 lg:min-h-[calc(100vh-3rem)] flex flex-col justify-start">
          <Hero />
          <Stats />
        </div>
        <Features />
        <AiAssistant />
        <Faq />
        <CtaBanner />
      </main>
      <Footer onNavigateLogin={() => navigateTo('login')} />
    </div>
  )
}
