import React, { useState } from 'react'
import { Plus } from 'lucide-react'

const faqItems = [
  {
    question: 'Apa itu UntungJelas?',
    answer: 'UntungJelas adalah platform manajemen keuangan dan operasional cerdas yang dirancang khusus untuk membantu UMKM menghitung harga pokok penjualan (HPP), mencatat transaksi, serta memantau laba bersih bisnis secara akurat dan mudah.',
  },
  {
    question: 'Apakah UntungJelas cocok untuk usaha kecil & warung makan?',
    answer: 'Sangat cocok. Sistem resep UntungJelas dirancang khusus untuk membagi biaya bahan baku porsi makanan secara detail, sangat ideal untuk warung makan, kuliner, dan usaha kecil yang harga bahannya sering berubah.',
  },
  {
    question: 'Bagaimana cara menghitung HPP produk secara otomatis?',
    answer: 'Cukup masukkan komposisi bahan baku beserta harga beli dan jumlah porsi (yield) yang dihasilkan resep. UntungJelas akan otomatis menghitung modal per unit dan persentase keuntungan Anda secara real-time.',
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="pt-6 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-28 bg-white scroll-mt-16 lg:scroll-mt-20 lg:min-h-[calc(100vh-3rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Heading & Accordion List (Larger & Prominent) */}
          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-gray-900 tracking-tight leading-[1.2]">
              Pertanyaan yang Sering<br className="hidden sm:inline" /> Diajukan
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500 leading-relaxed max-w-lg">
              Segala hal yang ingin Anda ketahui tentang cara kerja UntungJelas untuk mendampingi bisnis Anda.
            </p>

            <div className="mt-6 sm:mt-8 lg:mt-10 space-y-3 sm:space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-colors hover:border-gray-300"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full px-5 sm:px-7 py-4 sm:py-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-gray-900 hover:text-gray-700 transition-colors cursor-pointer select-none"
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <span className="text-gray-900 flex-shrink-0">
                        <Plus 
                          className={`w-5 h-5 stroke-[2.2] transition-transform duration-300 ease-in-out ${
                            isOpen ? 'rotate-45 text-[#00A86B]' : 'rotate-0'
                          }`} 
                        />
                      </span>
                    </button>
                    
                    {/* Smooth Animated Collapsible Content */}
                    <div 
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 sm:px-7 pb-5 pt-1 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Businessman Illustration - Diperbesar lebih tegap & proporsional */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-end">
            <div className="w-full max-w-[280px] sm:max-w-md lg:max-w-xl xl:max-w-[560px]">
              <img
                src="/assets/Pictures/Group 48.png"
                alt="Pertanyaan yang Sering Diajukan"
                className="w-full h-auto object-contain transform lg:scale-110 origin-bottom"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
