# BRIEF PROYEK

(Baca file ini sebelum mengerjakan tugas apa pun.)

Nama aplikasi: belum ditentukan (gunakan nama sementara "UntungApp" di kode dan UI; mudah diganti nanti).

## Konteks

Aplikasi web untuk lomba GTNIC 2026 kategori Web Development, sub-tema
"Accelerating Digital Transformation for Business and SMEs" (fokus UMKM
dan ekonomi digital). Deadline pengumpulan 10 November 2026 pukul 23:59 WIB,
jadi waktu sangat terbatas: utamakan fitur inti yang stabil dan tanpa
error, jangan menambah fitur di luar daftar.

Masalah: banyak pelaku UMKM menentukan harga jual tanpa menghitung modal
(HPP), sehingga rugi tanpa sadar. Aplikasi ini membantu pemilik usaha
menghitung modal per produk, mencatat penjualan, melihat untung-rugi
sebenarnya, dan mendapat saran AI berbahasa sehari-hari.

BUKAN marketplace: hanya pemilik usaha yang login; pembeli hanya
menerima struk digital.

## Stack

- Backend: Laravel (versi stabil terbaru), REST API, Laravel Sanctum token
  (Bearer). FE dan BE di-deploy di domain berbeda, JANGAN pakai cookie/SPA
  session auth.
- Frontend: React (Vite) + Tailwind CSS, React Router, axios.
- Database: MySQL (ganti ke PostgreSQL hanya jika hosting mengharuskan).
- AI: panggil LLM API dari backend saja. API key hanya di .env.
- Deploy: BE di Railway atau Render (dipilih saat deploy), FE di Vercel.
  Repo publik: tidak boleh ada secret; sediakan .env.example.
- Struktur repo (monorepo): backend/, frontend/, docs/.

## Fitur (urutan prioritas)

1. Auth: daftar/login pakai nomor HP + password; profil usaha (nama usaha,
   jenis usaha).
2. Produk dan HPP: produk + daftar bahan; modal per unit = total bahan
   dibagi jumlah hasil resep (yield_qty); status margin.
3. Kasir sederhana: catat penjualan, simpan snapshot harga dan modal.
4. Dashboard untung-rugi: untung hari ini, tren 7 hari, produk
   untung/rugi, insight AI harian.
5. Struk digital: halaman publik read-only lewat UUID.
6. Skor kesehatan usaha (0-100): rumus di backend, AI hanya menulis narasi.

Di luar scope (JANGAN dikerjakan): admin panel, chat, marketing, CRM, HR,
pembayaran online.

## Aturan domain (wajib konsisten)

- margin % = (harga_jual - modal_per_unit) / harga_jual x 100
- status: rugi (margin < 0), tipis (0 sampai < 20), sehat (>= 20). Ambang
  batas ada di config/hpp.php, bukan hardcode di controller.
- Transaksi menyimpan unit_price dan unit_cost saat penjualan (snapshot),
  supaya laporan lama tidak berubah ketika harga bahan berubah.
- Semua perhitungan (HPP, margin, untung, skor) dilakukan di backend
  (Service class). Frontend boleh menghitung preview, tetapi angka resmi
  dari backend.
- Semua data dibatasi per user_id; user tidak boleh mengakses data user lain.
- Panggilan AI: timeout pendek, cache per user per hari, dan SELALU ada
  fallback teks berbasis aturan jika AI gagal. UI tidak boleh error.

## Arsitektur kode

Controller tipis -> FormRequest (validasi) -> Service (logika bisnis) ->
Model/Eloquent. Respons lewat API Resource, format konsisten
{data, message}. Pesan error dalam bahasa Indonesia yang ramah.

## Gaya UI (untuk tahap frontend)

Hangat dan akrab, bukan SaaS generik: hijau uang, terracotta, kuning telur
asin. Angka "Untung Hari Ini" jadi elemen paling menonjol. Bahasa
sehari-hari ("Modal Sebenarnya", bukan "HPP" tanpa penjelasan). Hindari
kartu rounded + shadow yang seragam, badge warna-warni bertumpuk, dan ikon
AI generik (robot/sparkle). Mobile-first, responsif di Chrome, Firefox,
Safari, dan Edge.

## Cara kerja

- Buat rencana tugas dulu, tunggu persetujuan saya.
- Kerjakan per tahap. Tiap tahap: migrate, jalankan test, verifikasi
  endpoint sebelum lanjut. Commit per tahap.
- Setelah tiap tahap, tulis ringkasan singkat berbahasa Indonesia sederhana:
  alur request -> route -> controller -> service -> model, beserta alasan
  keputusan desainnya (agar saya bisa menjelaskannya ke juri).
- Jangan menambah dependensi atau fitur di luar brief tanpa bertanya.
