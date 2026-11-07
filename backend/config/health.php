<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Bobot Komponen Skor Kesehatan Usaha (Total 100 Poin)
    |--------------------------------------------------------------------------
    | Sesuai spesifikasi GTNIC 2026 TAHAP 6:
    | 1. margin: 40 poin untuk margin rata-rata tertimbang penjualan
    | 2. consistency: 30 poin untuk konsistensi penjualan 14 hari terakhir
    | 3. healthy_products: 30 poin untuk proporsi produk berstatus sehat
    */
    'weights' => [
        'margin' => 40,
        'consistency' => 30,
        'healthy_products' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Parameter Formula Perhitungan
    |--------------------------------------------------------------------------
    */
    // Target margin rata-rata tertimbang (%) untuk mendapatkan poin margin maksimal (40 poin)
    'target_margin_percent' => 40.0,

    // Jumlah hari ke belakang untuk perhitungan konsistensi penjualan
    'consistency_days' => 14,

    // Ambang batas persentase margin produk berstatus sehat (>= 20%)
    'healthy_margin_threshold' => 20.0,

    /*
    |--------------------------------------------------------------------------
    | Klasifikasi Kategori Skor (0 - 100)
    |--------------------------------------------------------------------------
    */
    'labels' => [
        'sangat_sehat' => [
            'min' => 80,
            'label' => 'Sangat Sehat',
        ],
        'sehat' => [
            'min' => 60,
            'label' => 'Sehat',
        ],
        'cukup' => [
            'min' => 40,
            'label' => 'Cukup',
        ],
        'kritis' => [
            'min' => 0,
            'label' => 'Kritis',
        ],
    ],
];

