import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white pt-14 pb-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-3">
            {/* Brand Logo + Text (Reference: Logo + UntungJelas, semibold, highlight #259A66) */}
            <a href="#beranda" className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
              <img
                src="/assets/Icons/logo.png"
                alt="UntungJelas Logo"
                className="h-7 sm:h-8 w-auto object-contain flex-shrink-0 transition-transform group-hover:scale-105"
              />
              <span className="text-lg sm:text-[19px] font-semibold tracking-tight text-gray-900 leading-none">
                Untung<span className="text-[#259A66]">Jelas</span>
              </span>
            </a>
            
            <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
              Platform manajemen bisnis dan keuangan berbasis AI untuk UMKM Indonesia.
            </p>

            {/* Social Icons in mint circles: LinkedIn, GitHub, Instagram */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* LinkedIn */}
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-[#E6F9F0] text-[#00A86B] flex items-center justify-center transition-opacity hover:opacity-80 font-bold text-[11px]"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.02-3.28 1.64 1.64 0 0 0 .02 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z"/>
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-[#E6F9F0] text-[#00A86B] flex items-center justify-center transition-opacity hover:opacity-80"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-[#E6F9F0] text-[#00A86B] flex items-center justify-center transition-opacity hover:opacity-80"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links: PRODUK */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 mb-3">
              PRODUK
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><a href="#fitur" className="hover:text-gray-900">Smart HPP</a></li>
              <li><a href="#fitur" className="hover:text-gray-900">Kasir Digital</a></li>
              <li><a href="#fitur" className="hover:text-gray-900">Laba Rugi</a></li>
              <li><a href="#fitur" className="hover:text-gray-900">AI Insight</a></li>
            </ul>
          </div>

          {/* Links: PERUSAHAAN */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 mb-3">
              PERUSAHAAN
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><a href="#" className="hover:text-gray-900">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-gray-900">Karir</a></li>
              <li><a href="#" className="hover:text-gray-900">Blog</a></li>
              <li><a href="#" className="hover:text-gray-900">Kontak</a></li>
            </ul>
          </div>

          {/* Links: BANTUAN */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 mb-3">
              BANTUAN
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><a href="#" className="hover:text-gray-900">Pusat Bantuan</a></li>
              <li><a href="#faq" className="hover:text-gray-900">FAQ</a></li>
              <li><a href="#" className="hover:text-gray-900">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-gray-900">Syarat & Ketentuan</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>© 2025 UntungJelas. Hak cipta dilindungi undang-undang.</p>
          <p className="flex items-center gap-1.5 text-gray-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B] stroke-[2.2]" />
            <span>Terverifikasi UMKM Indonesia.</span>
          </p>
        </div>

      </div>
    </footer>
  )
}
