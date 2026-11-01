import React from 'react'
import { Calculator, ShoppingCart, BarChart2, Sparkles, FileText, Lightbulb } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

export default function Features() {
  return (
    <section id="fitur" className="pt-6 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-24 bg-white scroll-mt-16 lg:scroll-mt-20 lg:min-h-[calc(100vh-3rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading: Enters with subtle fade-down */}
        <ScrollReveal variant="fade-down" duration={650}>
          <div className="text-center max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold text-gray-900 tracking-tight leading-tight md:whitespace-nowrap">
              Semua Kebutuhan Bisnis dalam Satu Platform
            </h2>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto">
              Fitur praktis untuk membantu UMKM mengelola biaya, penjualan, dan keuntungan.
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Cards Grid - Staggered 3D Flip-Up */}
        <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Smart HPP Calculator */}
          <ScrollReveal variant="flip-up" delay={50} duration={700} className="h-full">
            <div className="border border-[#D8D8D8] rounded-2xl p-5 sm:p-6 bg-white flex flex-col justify-between sm:min-h-[340px] h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#E6F9F0] text-[#00A86B] flex items-center justify-center mb-4 sm:mb-5">
                  <Calculator className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base sm:text-[17px] font-bold text-gray-900">
                  Smart HPP Calculator
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                  Hitung biaya produksi berdasarkan bahan baku, tenaga kerja, dan biaya operasional.
                </p>
              </div>

              <div className="mt-5 sm:mt-6">
                <div className="border border-[#E2E2E2] rounded-xl px-3.5 py-3 flex items-center justify-between bg-white h-[58px]">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Total HPP</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">Rp 12.500</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00A86B]">
                    <span>↑ +12.5%</span>
                    {/* Upward trending sparkline arrow */}
                    <svg className="w-8 h-4 text-[#00A86B] stroke-current fill-none stroke-2" viewBox="0 0 30 16">
                      <polyline points="2,14 12,8 18,11 26,3" />
                      <polyline points="21,3 26,3 26,8" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2: Digital Cashier */}
          <ScrollReveal variant="flip-up" delay={150} duration={700} className="h-full">
            <div className="border border-[#D8D8D8] rounded-2xl p-5 sm:p-6 bg-white flex flex-col justify-between sm:min-h-[340px] h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#E6F9F0] text-[#00A86B] flex items-center justify-center mb-4 sm:mb-5">
                  <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base sm:text-[17px] font-bold text-gray-900">
                  Digital Cashier
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                  Catat transaksi penjualan dengan mudah dan cepat.
                </p>
              </div>

              <div className="mt-5 sm:mt-6">
                <div className="border border-[#E2E2E2] rounded-xl px-3.5 py-3 flex items-center justify-between bg-white h-[58px]">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Total Transaksi</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">Rp 325.500</span>
                  </div>
                  <div className="w-7 h-7 rounded flex items-center justify-center text-gray-400">
                    <FileText className="w-5 h-5 stroke-[1.8]" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3: Profit Dashboard with Section 2 Chart Image */}
          <ScrollReveal variant="flip-up" delay={250} duration={700} className="h-full">
            <div className="border border-[#D8D8D8] rounded-2xl p-5 sm:p-6 bg-white flex flex-col justify-between sm:min-h-[340px] h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#E6F9F0] text-[#00A86B] flex items-center justify-center mb-4 sm:mb-5">
                  <BarChart2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base sm:text-[17px] font-bold text-gray-900">
                  Profit Dashboard
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                  Pantau pendapatan, pengeluaran, dan keuntungan bisnis.
                </p>
              </div>

              <div className="mt-5 sm:mt-6">
                <div className="border border-[#E2E2E2] rounded-xl p-2.5 flex items-end justify-center h-[58px] bg-white overflow-hidden">
                  <img
                    src="/assets/Pictures/chart-card-3.png"
                    alt="Grafik Profit Dashboard"
                    className="w-full h-full object-contain object-bottom"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 4: AI Business Insight */}
          <ScrollReveal variant="flip-up" delay={350} duration={700} className="h-full">
            <div className="border border-[#D8D8D8] rounded-2xl p-5 sm:p-6 bg-white flex flex-col justify-between sm:min-h-[340px] h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#E6F9F0] text-[#00A86B] flex items-center justify-center mb-4 sm:mb-5">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base sm:text-[17px] font-bold text-gray-900">
                  AI Business Insight
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] text-gray-600 leading-relaxed">
                  Dapatkan analisis dan rekomendasi berdasarkan data bisnis
                </p>
              </div>

              <div className="mt-5 sm:mt-6">
                <div className="border border-dashed border-[#A7F3D0] rounded-xl px-3 py-2 flex items-center gap-3 bg-white h-[58px]">
                  <div className="w-8 h-8 rounded-full bg-[#E6F9F0] text-[#00A86B] flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-gray-900 block truncate leading-tight">Penjualan naik 15%</span>
                    <span className="text-[10px] text-gray-500 block truncate">dibanding bulan lalu.</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  )
}
