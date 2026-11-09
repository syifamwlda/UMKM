import React, { useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  MessageCircle,
  Mail,
  Clock,
  ExternalLink,
  X,
  Store,
  Calculator,
  BarChart3,
  Settings
} from 'lucide-react'

// ─── Data Kategori Tab ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'hpp', label: 'Katalog & HPP' },
  { id: 'kasir', label: 'Kasir & Struk' },
  { id: 'laporan', label: 'Laporan Keuangan' },
  { id: 'akun', label: 'Akun & Profil' },
]

// ─── Data Pertanyaan & Jawaban ───────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    category: 'hpp',
    question: 'Bagaimana cara menambahkan menu baru dan menghitung HPP?',
    answer: 'Masuk ke menu "Katalog & HPP", lalu klik tombol "Tambah Produk". Masukkan nama produk, harga jual, dan rincian bahan baku beserta biayanya per porsi. Sistem akan langsung menjumlahkan HPP dan menampilkan estimasi persentase margin keuntungan.'
  },
  {
    category: 'hpp',
    question: 'Apa arti status "Sehat", "Tipis", dan "Rugi" pada produk?',
    answer: 'Status "Rugi" berarti harga jual menu lebih rendah dari modal bahan baku (HPP). Status "Tipis" berarti margin keuntungan di bawah 30% dan rentan rugi jika harga bahan naik. Status "Sehat" berarti margin berada di atas 30% dan aman untuk operasional.'
  },
  {
    category: 'hpp',
    question: 'Apakah HPP produk lama otomatis diperbarui jika harga bahan naik?',
    answer: 'Untuk menu yang sudah ada, Anda dapat membuka menu tersebut via tombol edit di Katalog & HPP, lalu ubah harga beli bahan baku yang naik. HPP dan status margin akan langsung dikalkulasi ulang.'
  },
  {
    category: 'kasir',
    question: 'Bagaimana cara mencatat pesanan di Kasir POS?',
    answer: 'Buka menu "Kasir", klik produk yang dipesan pelanggan untuk menambahkannya ke keranjang kasir. Pilih metode pembayaran (Tunai, QRIS, atau Kartu), lalu klik "Proses Pembayaran". Transaksi akan langsung tercatat dan struk digital akan terbit.'
  },
  {
    category: 'kasir',
    question: 'Bagaimana cara mengirim struk belanja digital ke pelanggan?',
    answer: 'Setelah pembayaran selesai, klik tombol "Salin Tautan" pada modal struk atau tombol "Buka Struk". Anda bisa langsung mengirimkan link struk tersebut kepada pelanggan via WhatsApp atau aplikasi pesan lainnya.'
  },
  {
    category: 'laporan',
    question: 'Data apa saja yang ditampilkan di Laporan Keuangan?',
    answer: 'Halaman Laporan Keuangan menampilkan akumulasi Total Omset Kotor, Total Beban Modal Bahan (HPP), Total Laba Bersih riil, rata-rata tiket transaksi (AOV), grafik arus kas mingguan, serta sebaran metode pembayaran (Tunai, QRIS, Kartu).'
  },
  {
    category: 'laporan',
    question: 'Apakah data laporan bisa diekspor?',
    answer: 'Bisa. Di pojok kanan atas halaman Laporan Keuangan terdapat tombol "Ekspor Laporan" untuk mengunduh rekap transaksi.'
  },
  {
    category: 'akun',
    question: 'Bagaimana cara memperbarui profil usaha dan nomor telepon?',
    answer: 'Buka menu "Pengaturan Toko" di sidebar kiri bawah. Anda dapat mengubah nama lengkap pemilik akun, nama toko/cabang, dan nomor telepon, lalu tekan tombol "Simpan Profil".'
  },
  {
    category: 'akun',
    question: 'Bagaimana cara mengubah kata sandi akun?',
    answer: 'Buka menu "Pengaturan Toko", scroll ke kartu "Keamanan Kata Sandi". Masukkan kata sandi saat ini, kata sandi baru (minimal 8 karakter), dan konfirmasi kata sandi baru, kemudian klik "Ubah Kata Sandi".'
  }
]

export default function HelpPage({ onNavigateMenu }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openIndex, setOpenIndex] = useState(null)

  // Filter FAQ berdasarkan kategori tab & input pencarian
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      const matchSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      return matchCategory && matchSearch
    })
  }, [selectedCategory, searchQuery])

  const toggleFaq = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  const handleOpenWhatsApp = () => {
    window.open('https://wa.me/6281234567890?text=Halo%20UntungJelas,%20saya%20butuh%20bantuan', '_blank')
  }

  return (
    <div className="space-y-5 animate-fade-in pb-16">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Pusat Bantuan &amp; Panduan
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pertanyaan yang sering diajukan dan kontak bantuan operasional UntungJelas.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pertanyaan atau kata kunci..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009B5B]/20 focus:border-[#009B5B] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Pills Kategori ───────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all'
            ? FAQ_ITEMS.length
            : FAQ_ITEMS.filter((f) => f.category === cat.id).length
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id)
                setOpenIndex(null)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* ── Main Layout: FAQ (8 cols) + Sidebar Kontak (4 cols) ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* ── LEFT COLUMN: FAQ List ──────────────────────────────────────── */}
        <div className="xl:col-span-8 space-y-2.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-[13px] font-semibold text-gray-900 hover:text-[#009B5B] transition-colors cursor-pointer select-none"
                  >
                    <span className="flex-1 pr-2 leading-snug">{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#009B5B]' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/30">
                      {item.answer}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <p className="text-xs font-semibold text-gray-700">Tidak ada pertanyaan yang sesuai</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Coba gunakan kata kunci pencarian yang lain atau pilih kategori di atas.
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Hubungi Dukungan ─────────────────────────────── */}
        <div className="xl:col-span-4 space-y-4">

          {/* Kartu Kontak Layanan */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5">
            <h3 className="text-sm font-bold text-gray-900">Hubungi Layanan Pengguna</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Jika mengalami kendala operasional, pertanyaan perhitungan HPP, atau kendala akun, silakan hubungi tim kami:
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-2.5 px-3 bg-[#009B5B] hover:bg-[#00874e] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp (+62 812-3456-7890)</span>
              </button>

              <a
                href="mailto:support@untungjelas.id"
                className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>support@untungjelas.id</span>
              </a>
            </div>

            <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-400">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Senin – Sabtu, 08:00 – 20:00 WIB</span>
            </div>
          </div>

          {/* Tautan Pintas Menu */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Pintasan Cepat</h3>
            <div className="space-y-1.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => onNavigateMenu && onNavigateMenu('Katalog & HPP')}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-gray-400" />
                  <span>Katalog &amp; Hitung HPP</span>
                </div>
                <span className="text-[10px] text-gray-400">Buka →</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateMenu && onNavigateMenu('Kasir')}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-gray-400" />
                  <span>Kasir POS &amp; Pesanan</span>
                </div>
                <span className="text-[10px] text-gray-400">Buka →</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateMenu && onNavigateMenu('Laporan Keuangan')}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Laporan Keuangan</span>
                </div>
                <span className="text-[10px] text-gray-400">Buka →</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateMenu && onNavigateMenu('Pengaturan Toko')}
                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-gray-400" />
                  <span>Pengaturan Profil &amp; Toko</span>
                </div>
                <span className="text-[10px] text-gray-400">Buka →</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
