# Skema Database & Rumus Keuangan UntungJelas

Dokumen ini mendokumentasikan skema database MySQL resmi dan rumus perhitungan HPP serta laba rugi final aplikasi UntungJelas untuk kompetisi GTNIC 2026.

---

## 1. Skema Database (MySQL)

### A. Tabel `users`
Menyimpan data identitas akun pemilik usaha (multi-tenant identity).
| Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto Increment | ID unik user |
| `name` | `VARCHAR(255)` | Not Null | Nama lengkap pemilik usaha |
| `phone` | `VARCHAR(255)` | Unique, Not Null | Nomor HP (format 08xx / +62xx) |
| `business_name` | `VARCHAR(255)` | Not Null | Nama usaha / toko / kedai |
| `business_type` | `VARCHAR(255)` | Not Null | Jenis usaha (Kuliner, Retail, Jasa, dll) |
| `password` | `VARCHAR(255)` | Not Null | Hash password (Bcrypt) |
| `created_at` | `TIMESTAMP` | Nullable | Waktu registrasi |
| `updated_at` | `TIMESTAMP` | Nullable | Waktu pembaruan profil |

---

### B. Tabel `products`
Menyimpan katalog produk milik masing-masing user.
| Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto Increment | ID unik produk |
| `user_id` | `BIGINT UNSIGNED` | Foreign Key (`users.id`), On Delete Cascade | Pemilik produk |
| `name` | `VARCHAR(255)` | Not Null | Nama menu / produk |
| `selling_price` | `DECIMAL(12, 2)` | Not Null | Harga jual per porsi/unit (Rp) |
| `yield_qty` | `DECIMAL(12, 2)` | Not Null, Default `1.00` | Hasil porsi per satu kali resep |
| `created_at` | `TIMESTAMP` | Nullable | Waktu produk dibuat |
| `updated_at` | `TIMESTAMP` | Nullable | Waktu produk diperbarui |

---

### C. Tabel `ingredients`
Menyimpan rincian bahan baku (resep) yang menyusun setiap produk.
| Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto Increment | ID unik bahan baku |
| `product_id` | `BIGINT UNSIGNED` | Foreign Key (`products.id`), On Delete Cascade | Produk pemilik bahan baku |
| `name` | `VARCHAR(255)` | Not Null | Nama bahan baku (misal: "Biji Kopi 18g") |
| `price` | `DECIMAL(12, 2)` | Not Null | Biaya bahan dalam resep (Rp) |
| `created_at` | `TIMESTAMP` | Nullable | Waktu pencatatan bahan |
| `updated_at` | `TIMESTAMP` | Nullable | Waktu pembaruan bahan |

---

### D. Tabel `transactions`
Menyimpan riwayat transaksi pembayaran penjualan kasir (POS).
| Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto Increment | ID transaksi |
| `user_id` | `BIGINT UNSIGNED` | Foreign Key (`users.id`), On Delete Cascade | User kasir pemilik transaksi |
| `uuid` | `CHAR(36)` | Unique, Not Null | Public UUID untuk struk digital |
| `total` | `DECIMAL(12, 2)` | Not Null | Total nilai penjualan kotor (Rp) |
| `paid_at` | `TIMESTAMP` | Nullable | Waktu pembayaran diselesaikan |
| `created_at` | `TIMESTAMP` | Nullable | Waktu transaksi dibuat di server |
| `updated_at` | `TIMESTAMP` | Nullable | Waktu pembaruan transaksi |

---

### E. Tabel `transaction_items`
Menyimpan rincian item dalam transaksi beserta snapshot harga & modal pada saat penjualan.
| Kolom | Tipe Data | Modifiers | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | Primary Key, Auto Increment | ID unik item transaksi |
| `transaction_id` | `BIGINT UNSIGNED` | Foreign Key (`transactions.id`), On Delete Cascade | Transaksi induk |
| `product_id` | `BIGINT UNSIGNED` | Foreign Key (`products.id`), On Delete Cascade | Produk yang dibeli |
| `qty` | `INT` | Not Null, Min 1 | Jumlah unit yang dibeli |
| `unit_price` | `DECIMAL(12, 2)` | Not Null | **Snapshot** harga jual saat transaksi |
| `unit_cost` | `DECIMAL(12, 2)` | Not Null | **Snapshot** modal HPP saat transaksi |
| `created_at` | `TIMESTAMP` | Nullable | Waktu item dicatat |
| `updated_at` | `TIMESTAMP` | Nullable | Waktu pembaruan item |

---

## 2. Prinsip Integritas Data & Snapshot

1. **User Scoping (Multi-tenancy Isolation)**:
   Setiap query ke `products` dan `transactions` wajib memfilter `user_id` milik user yang sedang terautentikasi melalui Laravel Sanctum.
2. **Snapshot Immutability**:
   `unit_price` dan `unit_cost` disimpan permanen di tabel `transaction_items` saat transaksi terjadi. Perubahan harga bahan baku atau harga produk di masa mendatang tidak akan pernah mengubah laporan keuangan atau kalkulasi untung-rugi historis.
3. **Atomic Operations**:
   Pencatatan produk (`Product` + `Ingredient`) dan pencatatan transaksi (`Transaction` + `TransactionItem`) wajib dibungkus dalam `DB::transaction(...)` agar terbebas dari inkonsistensi database.

---

## 3. Rumus Baku Keuangan & HPP (UntungJelas)

Semua kalkulasi dilakukan secara resmi di backend (`App\Services\HppService` dan `App\Services\TransactionService`).

### A. Perhitungan Modal per Unit (HPP)
$$\text{Total Modal Bahan} = \sum_{i=1}^{n} \text{price}_i$$

$$\text{Modal per Unit (HPP)} = \frac{\text{Total Modal Bahan}}{\text{yield\_qty}}$$

*Catatan: Jika `yield_qty` tidak diisi atau bernilai nol, server menggunakan default $1.00$.*

---

### B. Perhitungan Margin Keuntungan (%)
$$\text{Margin } (\%) = \left( \frac{\text{Harga Jual} - \text{Modal per Unit}}{\text{Harga Jual}} \right) \times 100\%$$

---

### C. Status Kesehatan Margin Produk (`config/hpp.php`)
Status dievaluasi berdasarkan ambang batas resmi yang dapat dikonfigurasi:
- **`sehat`**: $\text{Margin } (\%) \ge 20.0\%$
- **`tipis`**: $0.0\% \le \text{Margin } (\%) < 20.0\%$
- **`rugi`**: $\text{Margin } (\%) < 0.0\%$

---

### D. Perhitungan Keuntungan Transaksi Kasir
Untuk setiap item dalam transaksi:
$$\text{Subtotal Penjualan Item} = \text{qty} \times \text{unit\_price}$$
$$\text{Subtotal Modal Item} = \text{qty} \times \text{unit\_cost}$$
$$\text{Subtotal Laba Item} = \text{Subtotal Penjualan Item} - \text{Subtotal Modal Item}$$

Untuk keseluruhan transaksi:
$$\text{Total Transaksi} = \sum \text{Subtotal Penjualan Item}$$
$$\text{Total Modal Transaksi} = \sum \text{Subtotal Modal Item}$$
$$\text{Profit (Untung Bersih) Transaksi} = \text{Total Transaksi} - \text{Total Modal Transaksi}$$

