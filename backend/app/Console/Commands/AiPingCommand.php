<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

class AiPingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:ping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tes koneksi ke Gemini API menggunakan GEMINI_MODEL';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $apiKey = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $baseUrl = rtrim(config('services.gemini.url', 'https://generativelanguage.googleapis.com/v1beta'), '/');

        $this->info("=== PING GEMINI AI ===");
        $this->line("Model: {$model}");

        if (empty($apiKey)) {
            $this->line("Status HTTP: -");
            $this->error("Pesan Error: GEMINI_API_KEY kosong di .env");
            $this->line("Hasil: fallback");
            return 1;
        }

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(8)
            ->post("{$baseUrl}/models/{$model}:generateContent", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => 'Halo']
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'maxOutputTokens' => 10,
                ]
            ]);

            $status = $response->status();
            $this->line("Status HTTP: {$status}");

            if ($response->successful()) {
                $text = trim((string) $response->json('candidates.0.content.parts.0.text'));
                if (! empty($text)) {
                    $this->line("Pesan Error: -");
                    $this->info("Hasil: ai");
                    $this->line("Respon: {$text}");
                    return 0;
                } else {
                    $this->warn("Pesan Error: Respons sukses namun isi candidates kosong");
                    $this->line("Hasil: fallback");
                    return 0;
                }
            } else {
                $rawError = $response->body();
                $cleanError = str_replace($apiKey, '[REDACTED_API_KEY]', $rawError);
                $this->error("Pesan Error: {$cleanError}");
                $this->line("Hasil: fallback");
                return 1;
            }
        } catch (Throwable $e) {
            $cleanException = str_replace($apiKey, '[REDACTED_API_KEY]', $e->getMessage());
            $this->line("Status HTTP: Exception/Timeout");
            $this->error("Pesan Error: {$cleanException}");
            $this->line("Hasil: fallback");
            return 1;
        }
    }
}
