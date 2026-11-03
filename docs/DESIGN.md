# Panduan Desain Sistem & Komponen UntungJelas

Dokumen ini mendokumentasikan sistem desain resmi aplikasi UntungJelas yang diambil dan diselaraskan dari landing page dan komponen autentikasi buatan tim. Semua halaman, komponen baru, form, dan dashboard wajib mematuhi aturan ini agar konsistensi visual tetap terjaga.

---

## 1. Tipografi & Font

- **Primary Font**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Fallback Font**: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Konfigurasi CSS**: `font-family: 'Plus Jakarta Sans', sans-serif;`

### Hirarki Teks:
- **Hero Title**: `text-3xl sm:text-4xl lg:text-[44px] font-bold text-gray-900 tracking-tight leading-[122.7%]`
- **Section Heading**: `text-2xl sm:text-3xl lg:text-[38px] font-extrabold text-gray-900 tracking-tight`
- **Page / Modal Title**: `text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight`
- **Card Title**: `text-base sm:text-[17px] font-bold text-gray-900`
- **Body / Subtitle**: `text-xs sm:text-sm text-gray-600 leading-relaxed`
- **Form Label**: `text-xs font-semibold text-gray-800 mb-1.5`
- **Caption / Meta**: `text-[10px] sm:text-[11px] text-gray-400 font-medium`

---

## 2. Palet Warna (Color Palette)

### Brand Colors (Hijau Untung)
- **Primary Brand / Action**: `#009B5B` (Digunakan pada tombol utama, submit CTA, status aktif)
- **Primary Hover**: `#00854D` / `#00874E`
- **Brand Accent / Logo Highlight**: `#259A66`
- **Teal / Accent Green**: `#00A86B` (Digunakan untuk tren positif, ikon fitur, indikator)
- **Soft Green Background / Pill**: `#E6F9F0`, `#E8F8F2`, `#D8F3E5`

### Neutral & Backgrounds
- **Pure White**: `#FFFFFF` (Latar kartu, form card, container)
- **Soft Light Gray (App Background)**: `#F8F9FA` (Background halaman autentikasi & dashboard)
- **Border Grays**:
  - `#EDEDED` (Border kartu autentikasi & card halus)
  - `#E6E6E6` (Border navbar & separator)
  - `#E2E2E2` / `#D8D8D8` (Border kartu fitur & input preview)
  - `#E5E7EB` (Tailwind `border-gray-200` untuk form inputs)
- **Text Grays**:
  - `#111827` / `text-gray-900`: Headings & nilai angka dominan
  - `#1F2937` / `text-gray-800`: Navigasi & label form
  - `#4B5563` / `text-gray-600`: Paragraf deskripsi
  - `#9CA3AF` / `text-gray-400`: Placeholder & keterangan waktu

### Status Indikator Margin (Domain Rule)
- **Sehat (Margin >= 20%)**:
  - Text: `#00A86B` / `#059669`
  - Background: `#E6F9F0` / `#ECFDF5`
  - Border: `#A7F3D0`
- **Tipis (0% <= Margin < 20%)**:
  - Text: `#D97706` (Amber 600)
  - Background: `#FEF3C7` (Amber 50)
  - Border: `#FDE68A` (Amber 200)
- **Rugi (Margin < 0%)**:
  - Text: `#DC2626` (Red 600)
  - Background: `#FEE2E2` (Red 50)
  - Border: `#FECACA` (Red 200)

### Warna Interaktif Tambahan
- **Link Text**: `#0066CC` (Tautan biru ramah pengguna)
- **Google Accent**: `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`

---

## 3. Pola Komponen (Component Patterns)

### A. Kartu Autentikasi & Modal
- **Container**: `bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.06)] border border-[#EDEDED]`
- **Header Lockup**: Brand logo tengah (`/assets/Icons/logo.png`) + tulisan `Untung` (gray-900) dan `Jelas` (`#259A66`).
- **Layout Split (Desktop)**: Kiri kartu putih form, kanan ilustrasi banner banner (`/assets/Pictures/login-hero-banner.png`).

### B. Form Inputs & Kontrol
- **Field Wrapper**: `space-y-1.5`
- **Label**: `block text-xs font-semibold text-gray-800` (dengan tanda bintang merah `text-red-500` untuk wajib diisi)
- **Input Text / Number**:
  ```html
  <input className="w-full px-4 py-3 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#009B5B] focus:ring-1 focus:ring-[#009B5B] transition-all" />
  ```
- **Focus State**: Ring halus & border `#009B5B`.
- **Error State**: Border merah `border-red-400 focus:border-red-500 focus:ring-red-500`, pesan error kecil `text-[11px] text-red-600 font-medium mt-1`.

### C. Tombol (Buttons)
- **Primary Submit Button**:
  ```html
  <button className="w-full py-3.5 bg-[#009B5B] hover:bg-[#00854D] text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer">
  ```
- **Pill Action CTA**:
  ```html
  <button className="inline-flex items-center gap-2 bg-[#009B5B] hover:bg-[#00874E] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-sm">
  ```
- **Secondary / Back Button**:
  ```html
  <button className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer group">
  ```
- **Step / Navigation Tab Pill**:
  ```html
  <button className="px-4 py-2 text-xs font-semibold rounded-lg transition-colors bg-[#E6F9F0] text-[#009B5B]">
  ```

### D. Badge Status Margin
- **Badge Capsule**:
  ```html
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
  ```
  - Sehat: `bg-[#E6F9F0] text-[#009B5B] border border-[#A7F3D0]`
  - Tipis: `bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]`
  - Rugi: `bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]`

### E. Alert / Notifikasi Error & Sukses
- **Error Alert**: `p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium`
- **Success Alert**: `p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium`

---

## 4. Prinsip Tampilan Aplikasi
1. **Mobile-First & Responsif**: Semua layout diuji baik pada layar kecil smartphone (360px - 414px) maupun desktop lebar.
2. **Bahasa Indonesia Sehari-hari**: Menghindari istilah teknis akuntansi yang kaku. Contoh: menggunakan istilah "Modal Sebenarnya" (HPP), "Hasil Resep / Porsi", "Harga Jual", "Keuntungan / Margin".
3. **Penyajian Data Jelas**: Angka nominal selalu diformat Rupiah (`Rp 15.000`) dengan pemisah ribuan agar mudah dibaca pemilik UMKM.

