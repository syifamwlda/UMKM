<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Services\HppService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $hppService = app(HppService::class);

        // 1. Buat atau perbarui akun Demo UMKM
        $user = User::updateOrCreate(
            ['phone' => '081234567890'],
            [
                'name' => 'Budi Pratama',
                'business_name' => 'Kedai Kopi & Pastry Senja',
                'business_type' => 'Kuliner (Coffee & Bakery)',
                'password' => Hash::make('password123'),
            ]
        );

        // Bersihkan data produk dan transaksi lama milik user demo agar idempotent
        $user->transactions()->delete();
        $user->products()->delete();

        // 2. Buat 7 Produk lengkap dengan bahan baku (5 Sehat, 1 Tipis, 1 Rugi)
        $catalogDefinitions = [
            [
                'name' => 'Kopi Susu Gula Aren',
                'selling_price' => 18000,
                'yield_qty' => 1,
                'ingredients' => [
                    ['name' => 'Biji Kopi Espresso 18g', 'price' => 3500],
                    ['name' => 'Susu Fresh UHT 120ml', 'price' => 3000],
                    ['name' => 'Gula Aren Organik 25ml', 'price' => 1000],
                    ['name' => 'Cup & Tutup Bio', 'price' => 1000],
                ], // Modal: 8500, Margin: 52.78% (SEHAT)
            ],
            [
                'name' => 'Cafe Latte Gayo',
                'selling_price' => 22000,
                'yield_qty' => 1,
                'ingredients' => [
                    ['name' => 'Double Shot Espresso Gayo', 'price' => 5000],
                    ['name' => 'Susu Steam UHT 150ml', 'price' => 4000],
                    ['name' => 'Cup & Tutup', 'price' => 1000],
                ], // Modal: 10000, Margin: 54.55% (SEHAT)
            ],
            [
                'name' => 'Matcha Latte Kyoto',
                'selling_price' => 24000,
                'yield_qty' => 1,
                'ingredients' => [
                    ['name' => 'Pure Matcha Powder Kyoto', 'price' => 7000],
                    ['name' => 'Susu Segar UHT', 'price' => 4500],
                    ['name' => 'Gula Tebu Cair', 'price' => 1000],
                    ['name' => 'Cup & Sedotan', 'price' => 1000],
                ], // Modal: 13500, Margin: 43.75% (SEHAT)
            ],
            [
                'name' => 'Roti Bakar Coklat Keju',
                'selling_price' => 16000,
                'yield_qty' => 1,
                'ingredients' => [
                    ['name' => 'Roti Brioche Tebal', 'price' => 4000],
                    ['name' => 'Cokelat Meses', 'price' => 2500],
                    ['name' => 'Keju Cheddar Parut', 'price' => 2500],
                    ['name' => 'Margarin Gurih', 'price' => 1000],
                ], // Modal: 10000, Margin: 37.50% (SEHAT)
            ],
            [
                'name' => 'Cold Brew Coffee',
                'selling_price' => 20000,
                'yield_qty' => 1,
                'ingredients' => [
                    ['name' => 'Kopi Arabika Steeped 16 Jam', 'price' => 6000],
                    ['name' => 'Botol Kaca & Label Stiker', 'price' => 3500],
                ], // Modal: 9500, Margin: 52.50% (SEHAT)
            ],
            [
                // MARGIN TIPIS (Ambang batas 0% - 20%)
                'name' => 'Brownies Panggang Mini',
                'selling_price' => 12000,
                'yield_qty' => 1,
                'ingredients' => [
                    ['name' => 'Dark Compound Chocolate', 'price' => 5000],
                    ['name' => 'Telur & Mentega', 'price' => 3500],
                    ['name' => 'Tepung Terigu & Gula Pasir', 'price' => 2200],
                ], // Modal: 10700, Margin: 10.83% (TIPIS)
            ],
            [
                // MARGIN RUGI (Margin < 0%)
                'name' => 'Croissant Cokelat Butter',
                'selling_price' => 10000,
                'yield_qty' => 1,
                'ingredients' => [
                    ['name' => 'French Butter AOP Pastry', 'price' => 6500],
                    ['name' => 'Isian Pasta Cokelat', 'price' => 3000],
                    ['name' => 'Tepung Terigu Khusus Pastry', 'price' => 1500],
                ], // Modal: 11000, Margin: -10.00% (RUGI)
            ],
        ];

        $createdProducts = [];
        foreach ($catalogDefinitions as $def) {
            $p = $user->products()->create([
                'name' => $def['name'],
                'selling_price' => $def['selling_price'],
                'yield_qty' => $def['yield_qty'],
            ]);

            foreach ($def['ingredients'] as $ing) {
                $p->ingredients()->create($ing);
            }

            $createdProducts[] = [
                'model' => $p,
                'price' => (float) $p->selling_price,
                'cost' => $hppService->getModalPerUnit($p),
            ];
        }

        // 3. Buat 18 hari riwayat transaksi (17 hari lalu sampai hari ini)
        $today = Carbon::today();
        $totalDays = 18;

        for ($d = $totalDays - 1; $d >= 0; $d--) {
            $currentDate = $today->copy()->subDays($d);
            $dayOfWeek = (int) $currentDate->format('w'); // 0 = Minggu, 6 = Sabtu

            // Volume transaksi bervariasi: akhir pekan lebih ramai
            $numTransactions = ($dayOfWeek === 0 || $dayOfWeek === 6 || $dayOfWeek === 5)
                ? rand(8, 14)
                : rand(4, 9);

            for ($t = 0; $t < $numTransactions; $t++) {
                // Jam transaksi antara 08:00 sampai 20:45
                $hour = rand(8, 20);
                $minute = rand(0, 59);
                $second = rand(0, 59);
                $paidAt = $currentDate->copy()->setTime($hour, $minute, $second);

                // Pilih 1 sampai 3 produk berbeda dalam satu transaksi
                $selectedIndexes = (array) array_rand($createdProducts, rand(1, 3));
                $preparedItems = [];
                $trxTotal = 0.0;

                foreach ($selectedIndexes as $idx) {
                    $prodMeta = $createdProducts[$idx];
                    $qty = rand(1, 3);
                    $itemSubtotal = $prodMeta['price'] * $qty;
                    $trxTotal += $itemSubtotal;

                    $preparedItems[] = [
                        'product_id' => $prodMeta['model']->id,
                        'qty' => $qty,
                        'unit_price' => $prodMeta['price'],
                        'unit_cost' => $prodMeta['cost'],
                    ];
                }

                $transaction = $user->transactions()->create([
                    'uuid' => (string) Str::uuid(),
                    'total' => round($trxTotal, 2),
                    'paid_at' => $paidAt,
                    'created_at' => $paidAt,
                    'updated_at' => $paidAt,
                ]);

                $transaction->items()->createMany($preparedItems);
            }
        }
    }
}

