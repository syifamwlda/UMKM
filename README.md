# UntungJelas 📈

Aplikasi pencatatan modal (HPP), kasir POS penjualan, dan pemantau laba rugi sebenarnya berbasis web untuk UMKM Indonesia. Dibuat untuk kompetisi **GTNIC 2026** kategori Web Development (*Accelerating Digital Transformation for Business and SMEs*).

---

## 🔑 Akun Demo (Ready-to-Test)

Database telah dilengkapi dengan data *seeder* realistis (7 menu kopi & pastry, 18 hari riwayat transaksi, grafik tren, serta status margin sehat, tipis, dan rugi).

| Keterangan | Nilai |
| :--- | :--- |
| **Nomor HP** | `081234567890` |
| **Password** | `password123` |
| **Nama Pemilik** | Budi Pratama |
| **Nama Usaha** | Kedai Kopi & Pastry Senja |
| **Jenis Usaha** | Kuliner (Coffee & Bakery) |

---

## 🛠️ Tech Stack

- **Backend**: Laravel 11, REST API, Laravel Sanctum Token (Bearer), MySQL Database
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios
- **Arsitektur**: Controller Tipis $\rightarrow$ FormRequest Validasi $\rightarrow$ Service Class Logika Bisnis $\rightarrow$ Eloquent Model

---

## 🚀 Cara Menjalankan Project

### 1. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=DemoSeeder
php artisan serve
```
Backend berjalan di: `http://localhost:8000`

### 2. Frontend (React Vite)
```bash
npm install
npm run dev
```
Frontend berjalan di: `http://localhost:5173`

---

## 🧪 Menjalankan Automated Feature Tests
```bash
cd backend
php artisan test
```

---

## 📚 Dokumentasi Terkait
- [Brief & Aturan Domain](docs/BRIEF.md)
- [Dokumentasi REST API](docs/API.md)
- [Panduan Desain & Style UI](docs/DESIGN.md)
- [Skema Database & Rumus Keuangan](docs/SCHEMA.md)

