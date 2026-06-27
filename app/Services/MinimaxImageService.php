<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class MinimaxImageService
{
    private string $apiUrl = 'https://api.minimax.io/v1/image_generation';

    public function generate(
        string $prompt,
        string $aspectRatio = '1:1',
        int $n = 1,
        bool $promptOptimizer = false,
        ?int $seed = null,
        ?UploadedFile $referenceImage = null,
        string $subjectType = 'character',
    ): array {
        $payload = [
            'model' => 'image-01',
            'prompt' => $prompt,
            'aspect_ratio' => $aspectRatio,
            'response_format' => 'base64',
            'n' => $n,
            'prompt_optimizer' => $promptOptimizer,
        ];

        if ($seed !== null) {
            $payload['seed'] = $seed;
        }

        if ($referenceImage !== null) {
            $payload['subject_reference'] = [
                [
                    'type' => $subjectType,
                    'image_file' => $this->fileToDataUrl($referenceImage),
                ],
            ];
        }

        $response = Http::withToken(config('ai.providers.minimax.key'))
            ->withHeader('Content-Type', 'application/json')
            ->timeout(120)
            ->post($this->apiUrl, $payload);

        if ($response->failed()) {
            $body = $response->json();

            throw new \RuntimeException(
                $body['base_resp']['status_msg']
                    ?? $response->body()
                    ?? 'Error al generar imagen',
                $response->status(),
            );
        }

        $body = $response->json();

        if (($body['base_resp']['status_code'] ?? -1) !== 0) {
            throw new \RuntimeException(
                $body['base_resp']['status_msg'] ?? 'Error desconocido',
            );
        }

        $images = $body['data']['image_base64'] ?? [];

        if (empty($images)) {
            throw new \RuntimeException('No se generaron imágenes');
        }

        return [
            'images' => $images,
            'trace_id' => $body['id'] ?? null,
            'success_count' => $body['metadata']['success_count'] ?? count($images),
            'failed_count' => $body['metadata']['failed_count'] ?? 0,
        ];
    }

    public function fileToDataUrl(UploadedFile $file): string
    {
        $mime = $file->getMimeType();
        $base64 = base64_encode($file->getContent());

        return "data:{$mime};base64,{$base64}";
    }
}
