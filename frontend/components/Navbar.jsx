import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'

const navLinks = [
  { id: 'beranda', label: 'Beranda', href: '#beranda' },
  { id: 'fitur', label: 'Fitur', href: '#fitur' },
  { id: 'ai-pintar', label: 'AI Pintar', href: '#ai-pintar' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('beranda')
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  const navRef = useRef(null)

  // Measure and align the green indicator accurately with offsetLeft and offsetWidth
  const updateIndicatorPosition = (id) => {
    const el = document.getElementById(`nav-${id}`)
    if (el) {
      setIndicator({
        left: el.offsetLeft,
        width: el.offsetWidth,
        ready: true,
      })
    }
  }

  // Update synchronously before paint
  useLayoutEffect(() => {
    updateIndicatorPosition(activeNav)
  }, [activeNav])

  // Recalculate on window resize or initial font load
  useEffect(() => {
    const onResize = () => updateIndicatorPosition(activeNav)
    window.addEventListener('resize', onResize)
    
    const timer1 = setTimeout(onResize, 50)
    const timer2 = setTimeout(onResize, 200)

    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [activeNav])

  // Scroll spy to update active nav as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 768
      const scrollPosition = window.scrollY + (isMobile ? 80 : 120)
      navLinks.forEach((link) => {
        const section = document.getElementById(link.id)
        if (section) {
          const top = section.offsetTop
          const height = section.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveNav(link.id)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll handler with mobile & desktop pixel-perfect offsets
  const handleNavClick = (e, link) => {
    setActiveNav(link.id)
    setMobileMenuOpen(false)
    if (link.href.startsWith('#')) {
      e.preventDefault()

      // When clicking Beranda, always smoothly return to the absolute top
      if (link.id === 'beranda') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
        window.history.pushState(null, '', link.href)
        return
      }

      // Small timeout ensures the mobile dropdown closes cleanly
      setTimeout(() => {
        const target = document.querySelector(link.href)
        if (target) {
          const isMobile = window.innerWidth < 768
          const navbarHeight = isMobile ? 64 : 80
          const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight
          window.scrollTo({
            top: targetTop > 0 ? targetTop : 0,
            behavior: 'smooth',
          })
          window.history.pushState(null, '', link.href)
        }
      }, 50)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar card with rounded bottom corners, stroke #E6E6E6 and shadow (Y: 3, Blur: 4, 5%) */}
        <div className="bg-white/95 backdrop-blur-md rounded-b-2xl shadow-[0px_3px_4px_rgba(0,0,0,0.05)] border border-[#E6E6E6] px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Left: Logo + Nav links grouped together */}
          <div className="flex items-center space-x-6 sm:space-x-8 lg:space-x-12 h-full">
            {/* Gray placeholder logo */}
            <div className="w-24 sm:w-32 h-7 sm:h-8 bg-[#D9D9D9] rounded-sm flex-shrink-0"></div>

            {/* Navigation links - Using gap instead of space-x to prevent absolute child margin distortion */}
            <nav ref={navRef} className="relative hidden md:flex items-center gap-7 lg:gap-9 h-full">
              {navLinks.map((link) => {
                const isActive = activeNav === link.id
                return (
                  <a
                    key={link.id}
                    id={`nav-${link.id}`}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`relative h-full flex items-center text-sm transition-colors py-2 cursor-pointer select-none ${
                      isActive
                        ? 'font-semibold text-[#00A86B]'
                        : 'font-medium text-gray-800 hover:text-gray-950'
                    }`}
                  >
                    {link.label}
                  </a>
                )
              })}

              {/* Smooth Gliding Underline Indicator */}
              <span
                className="absolute bottom-0 h-[2.5px] bg-[#00A86B] rounded-t-sm transition-all duration-300 ease-out pointer-events-none"
                style={{
                  left: `${indicator.left}px`,
                  width: `${indicator.width}px`,
                  opacity: indicator.ready && indicator.width > 0 ? 1 : 0,
                }}
              />
            </nav>
          </div>

          {/* Right: Masuk & Mulai Gratis Button */}
          <div className="hidden sm:flex items-center space-x-6 lg:space-x-7">
            <a 
              href="#login" 
              className="text-sm font-medium text-gray-800 hover:text-gray-950 transition-colors"
            >
              Masuk
            </a>
            <a 
              href="#daftar" 
              className="inline-flex items-center gap-2 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 rounded-full transition-colors shadow-sm"
            >
              <span>Mulai Gratis</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-gray-700 hover:text-gray-950 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 stroke-[2]" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown - Floating Absolute Overlay that does NOT push page content */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 px-4 sm:px-6 pt-2 z-50">
          <div className="bg-white border border-[#E6E6E6] rounded-2xl p-4 shadow-[0px_10px_30px_rgba(0,0,0,0.08)] space-y-3">
            {navLinks.map((link) => {
              const isActive = activeNav === link.id
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`block px-3.5 py-2.5 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'font-semibold text-[#00A86B] bg-[#E6F9F0]'
                      : 'font-medium text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
              <a 
                href="#login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-lg"
              >
                Masuk
              </a>
              <a 
                href="#daftar" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#009B5B] text-white text-sm font-semibold py-2.5 rounded-full"
              >
                <span>Mulai Gratis</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
