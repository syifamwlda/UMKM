import React from 'react'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-6 sm:pt-8 lg:pt-14 pb-4 lg:pb-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-5 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-gray-900 tracking-tight leading-[122.7%]">
              Kelola Bisnis Lebih<br />
              Mudah, Pahami<br />
              Keuntungan Lebih Jelas.
            </h1>
            
            <p className="mt-5 text-sm sm:text-base text-gray-600 leading-relaxed max-w-md">
              Hitung biaya produksi, catat penjualan, dan pantau keuntungan bisnis dalam satu platform yang praktis dan cerdas.
            </p>

            <div className="mt-8">
              <a
                href="#daftar"
                className="inline-flex items-center gap-2 bg-[#009B5B] hover:bg-[#00874e] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-colors shadow-sm"
              >
                <span>Mulai Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Dashboard Visual */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <img
              src="/assets/Pictures/Group 50.png"
              alt="UntungJelas Dashboard Preview"
              className="w-full max-w-2xl h-auto object-contain"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
