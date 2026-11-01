import React from 'react'
import ScrollReveal from './ScrollReveal'

const statsData = [
  { value: '99.8%', label: 'Akurasi Gramatur Bahan', isGreen: false },
  { value: '3 Detik', label: 'Transaksi Kasir Cepat', isGreen: false },
  { value: '100%', label: 'Visibilitas Margin Laba', isGreen: true },
  { value: '10.000+', label: 'UMKM Telah Bergabung', isGreen: false },
]

export default function Stats() {
  return (
    <section className="pt-2 pb-12 lg:pt-2 lg:pb-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {statsData.map((stat, idx) => (
            <ScrollReveal
              key={idx}
              variant="pop"
              delay={idx * 120}
              duration={650}
            >
              <div
                className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
                  stat.isGreen ? 'text-[#00A86B]' : 'text-gray-900'
                }`}
              >
                {stat.value}
              </div>
              <div className="mt-1.5 text-xs text-gray-500 font-medium">
                {stat.label}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
