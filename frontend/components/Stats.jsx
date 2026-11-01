import React from 'react'

export default function Stats() {
  return (
    <section className="pt-2 pb-12 lg:pt-2 lg:pb-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              99.8%
            </div>
            <div className="mt-1.5 text-xs text-gray-500 font-medium">
              Akurasi Gramatur Bahan
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              3 Detik
            </div>
            <div className="mt-1.5 text-xs text-gray-500 font-medium">
              Transaksi Kasir Cepat
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#00A86B] tracking-tight">
              100%
            </div>
            <div className="mt-1.5 text-xs text-gray-500 font-medium">
              Visibilitas Margin Laba
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              10.000+
            </div>
            <div className="mt-1.5 text-xs text-gray-500 font-medium">
              UMKM Telah Bergabung
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
