import React from 'react'
import { ArrowRight } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#EBFBF3] via-[#DCF9EA] to-[#D0F5E1] overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Decorative Piggy Bank on the left */}
      <div className="absolute left-4 sm:left-10 lg:left-16 top-1/2 -translate-y-1/2 w-20 sm:w-28 lg:w-36 pointer-events-none select-none">
        <img
          src="/assets/Icons/boxicons_piggy-bank.png"
          alt="Piggy Bank"
          className="w-full h-auto object-contain opacity-90"
        />
      </div>

      {/* Decorative Growth Arrow on the bottom right */}
      <div className="absolute right-4 sm:right-10 lg:right-16 bottom-4 sm:bottom-6 w-20 sm:w-28 lg:w-36 pointer-events-none select-none">
        <img
          src="/assets/Icons/streamline_graph-arrow-increase.png"
          alt="Growth Arrow"
          className="w-full h-auto object-contain opacity-90"
        />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
          Mulai Kelola Bisnis Lebih Cerdas Hari ini!
        </h2>
        
        <p className="mt-3.5 text-xs sm:text-sm text-gray-700 leading-relaxed max-w-xl mx-auto">
          Jangan biarkan keuntungan bisnis Anda hanya menjadi perkiraan diangan-angan. Kendalikan modal, pantau laba bersih, dan kembangkan usaha dengan kepastian data.
        </p>

        <div className="mt-7">
          <a
            href="#daftar"
            className="inline-flex items-center gap-2 bg-[#008A50] hover:bg-[#007342] text-white text-xs sm:text-sm font-semibold px-7 py-3 rounded-full transition-colors shadow-sm"
          >
            <span>Mulai Gratis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
