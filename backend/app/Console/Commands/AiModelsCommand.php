<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

class AiModelsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:models';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Menampilkan daftar model Gemini yang mendukung generateContent';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $apiKey = config('services.gemini.key');
        $baseUrl = rtrim(config('services.gemini.url', 'https://generativelanguage.googleapis.com/v1beta'), '/');

        if (empty($apiKey)) {
            $this->error('GEMINI_API_KEY belum dikonfigurasi di file .env.');
            return 1;
        }

        $this->info("Menghubungi Gemini API ({$baseUrl}/models)...");

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
            ])
            ->timeout(10)
            ->get("{$baseUrl}/models");

            if (! $response->successful()) {
                $rawBody = $response->body();
                // Sanitasi jika API key tak sengaja muncul di body
                $cleanBody = str_replace($apiKey, '[REDACTED_API_KEY]', $rawBody);
                $this->error("Gagal mengambil daftar model (HTTP {$response->status()}):");
                $this->line($cleanBody);
                return 1;
            }

            $models = $response->json('models', []);
            $supportedModels = [];

            foreach ($models as $item) {
                $methods = $item['supportedGenerationMethods'] ?? [];
                if (in_array('generateContent', $methods, true)) {
                    $rawName = $item['name'] ?? '';
                    $cleanName = preg_replace('/^models\//', '', $rawName);
                    $supportedModels[] = [
                        'name' => $cleanName,
                        'display' => $item['displayName'] ?? '-',
                        'version' => $item['version'] ?? '-',
                    ];
                }
            }

            if (empty($supportedModels)) {
                $this->warn('Tidak ditemukan model yang mendukung generateContent.');
                return 0;
            }

            $this->info('Model yang mendukung generateContent:');
            $this->table(['Model (tanpa prefix models/)', 'Display Name', 'Version'], $supportedModels);

            return 0;
        } catch (Throwable $e) {
            $errorMsg = str_replace($apiKey, '[REDACTED_API_KEY]', $e->getMessage());
            $this->error("Terjadi kesalahan saat memanggil Gemini API: {$errorMsg}");
            return 1;
        }
    }
}

