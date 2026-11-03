import React from 'react'
import ScrollReveal from './ScrollReveal'

export default function AiAssistant() {
  return (
    <section id="ai-pintar" className="pt-6 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-28 bg-white scroll-mt-16 lg:scroll-mt-20 lg:min-h-[calc(100vh-3rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading - Diperbesar */}
        <ScrollReveal direction="up" duration={600}>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-gray-900 tracking-tight leading-[1.2]">
              Punya Asisten Pintar untuk Memahami Bisnis Anda.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Tidak perlu rumus spreadsheet yang rumit. Tanyakan langsung kondisi penjualan, stok yang menipis, atau produk paling cuan dengan bahasa Indonesia sehari-hari.
            </p>
          </div>
        </ScrollReveal>

        {/* AI Assistant Image Card - Futuristic Zoom-In Pop */}
        <div className="mt-6 sm:mt-10 lg:mt-14 flex justify-center">
          <ScrollReveal variant="zoom-in" delay={180} duration={800} className="w-full max-w-4xl">
            <img
              src="/assets/Pictures/Frame 14.png"
              alt="UntungJelas AI Assistant"
              className="w-full h-auto object-contain"
            />
          </ScrollReveal>
        </div>

      </div>
    </section>
  )
}
