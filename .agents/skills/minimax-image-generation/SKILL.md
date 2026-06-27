---
name: minimax-image-generation
description: >
  Generate images using MiniMax's image-01 model from Laravel. Use this skill when the user asks to create, generate, or produce images using MiniMax, or when working with the MiniMax image generation API. This includes text-to-image, image-to-image (with reference/subject images), storing results with Spatie MediaLibrary or Laravel's filesystem, setting aspect ratios, and handling API responses. Activate even if the user just mentions "generate an image" and has MiniMax configured.
---

# MiniMax Image Generation (Laravel)

MiniMax provides a powerful image generation API (`image-01` model) that supports text-to-image and image-to-image (with subject reference). The Laravel AI SDK (`laravel/ai`) does **not** natively support MiniMax for images, so you must call the API directly.

## Configuration

The MiniMax API key is already in `.env` as `MINIMAX_API_KEY`. Use it with Laravel's `Http` facade:

```php
use Illuminate\Support\Facades\Http;

$response = Http::withToken(config('ai.providers.minimax.key'))
    ->post('https://api.minimax.io/v1/image_generation', [
        'model' => 'image-01',
        'prompt' => '...',
        'aspect_ratio' => '16:9',
        'response_format' => 'base64',
    ]);
```

## Full API Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `model` | string | ✓ | — | `image-01` or `image-01-live` |
| `prompt` | string | ✓ | — | Text description, max 1500 chars |
| `aspect_ratio` | string | | `1:1` | `1:1`, `16:9`, `4:3`, `3:2`, `2:3`, `3:4`, `9:16`, `21:9` |
| `width` | int | | — | Custom width (512–2048, divisible by 8). `aspect_ratio` takes priority if both set. |
| `height` | int | | — | Custom height (512–2048, divisible by 8) |
| `response_format` | string | | `url` | `url` (expires 24h) or `base64` |
| `n` | int | | `1` | Number of images (1–9) |
| `seed` | int | | — | Random seed for reproducibility |
| `prompt_optimizer` | bool | | `false` | Auto-improve the prompt |
| `subject_reference` | array | | — | Array of `{type, image_file}` for I2I |

This project uses `base64` response format, then decodes and stores images in Spatie MediaLibrary via the `App\Services\MinimaxImageService` class.

## Existing Service

The project has `App\Services\MinimaxImageService` which wraps the API:

```php
use App\Services\MinimaxImageService;

$result = app(MinimaxImageService::class)->generate(
    prompt: 'A serene mountain landscape',
    aspectRatio: '16:9',
    n: 1,
    promptOptimizer: false,
    seed: null,
    referenceImage: $uploadedFile, // null for text-to-image
    subjectType: 'character',
);

// Returns:
// [
//   'images' => ['base64...', ...],
//   'trace_id' => '...',
//   'success_count' => 1,
//   'failed_count' => 0,
// ]
```

For reference images, the service converts `UploadedFile` to a data URI automatically.

## Endpoint

- **GET `/admin/media/generate`** — renders the generation form page
- **POST `/admin/media/generate`** — generates and stores images via `MediaController::generateStore`

Generated images are stored in Spatie MediaLibrary via `MediaHolder::addMediaFromString()`, which makes them appear in the media gallery.

## Text-to-Image

### Basic usage

```php
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

$response = Http::withToken(config('ai.providers.minimax.key'))
    ->post('https://api.minimax.io/v1/image_generation', [
        'model' => 'image-01',
        'prompt' => 'A serene mountain landscape at sunset, photorealistic',
        'aspect_ratio' => '16:9',
        'response_format' => 'base64',
    ]);

$response->throw();

$images = $response->json('data.image_base64');

foreach ($images as $i => $base64) {
    $imageData = base64_decode($base64);
    Storage::disk('public')->put("minimax/output-{$i}.jpeg", $imageData);
}
```

### Store with MediaLibrary

```php
$response = Http::withToken(config('ai.providers.minimax.key'))
    ->post('https://api.minimax.io/v1/image_generation', [
        'model' => 'image-01',
        'prompt' => 'A serene mountain landscape',
        'aspect_ratio' => '16:9',
        'response_format' => 'base64',
    ]);

$response->throw();
$base64 = $response->json('data.image_base64.0');
$imageData = base64_decode($base64);

$media = $someModel
    ->addMediaFromString($imageData)
    ->usingFileName('minimax-' . now()->timestamp . '.jpeg')
    ->withCustomProperties(['source' => 'minimax', 'prompt' => 'A serene mountain landscape'])
    ->toMediaCollection();
```

## Image-to-Image (Subject Reference)

Generate an image that preserves the subject of a reference image:

```php
$response = Http::withToken(config('ai.providers.minimax.key'))
    ->post('https://api.minimax.io/v1/image_generation', [
        'model' => 'image-01',
        'prompt' => 'A girl stands by the library window, gazing into the distance',
        'aspect_ratio' => '16:9',
        'subject_reference' => [
            [
                'type' => 'character',
                'image_file' => 'https://example.com/reference.jpg',
            ],
        ],
        'response_format' => 'base64',
    ]);
```

The `subject_reference.type` must be `'character'`. The `image_file` can be a public URL or a base64 data URI (`data:image/jpeg;base64,...`). Image requirements: JPG/JPEG/PNG, less than 10MB, single front-facing portrait preferred.

## Error Handling

```php
use Illuminate\Http\Client\RequestException;

try {
    $response = Http::withToken(config('ai.providers.minimax.key'))
        ->timeout(60)
        ->post('https://api.minimax.io/v1/image_generation', $payload);

    $response->throw();
} catch (RequestException $e) {
    $body = $e->response->json();
    $statusCode = $body['base_resp']['status_code'] ?? -1;
    $statusMsg = $body['base_resp']['status_msg'] ?? 'Unknown error';

    // Status codes:
    // 0    = Success
    // 1002 = Rate limited
    // 1004 = Auth failed
    // 1008 = Insufficient balance
    // 1026 = Sensitive content
    // 2013 = Invalid params
    // 2049 = Invalid API key

    logger()->error('MiniMax image generation failed', [
        'status_code' => $statusCode,
        'status_msg' => $statusMsg,
    ]);

    throw $e;
}
```

## Agent with MiniMax Images

```php
class ImageGeneratorAgent implements Agent, HasTools
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You are an image generation assistant using MiniMax.';
    }

    public function tools(): iterable
    {
        return [
            new class implements Tool
            {
                public function description(): Stringable|string
                {
                    return 'Generate an image using MiniMax image-01.';
                }

                public function schema(JsonSchema $schema): array
                {
                    return [
                        'prompt' => $schema->string()->required()
                            ->description('Detailed text prompt'),
                        'aspect_ratio' => $schema->string()
                            ->enum(['16:9', '1:1', '4:3', '3:4', '9:16', '3:2', '2:3', '21:9'])
                            ->description('Aspect ratio'),
                    ];
                }

                public function handle(Request $request): Stringable|string
                {
                    $response = Http::withToken(config('ai.providers.minimax.key'))
                        ->timeout(60)
                        ->post('https://api.minimax.io/v1/image_generation', [
                            'model' => 'image-01',
                            'prompt' => $request['prompt'],
                            'aspect_ratio' => $request['aspect_ratio'] ?? '16:9',
                            'response_format' => 'base64',
                        ]);

                    $response->throw();

                    $images = $response->json('data.image_base64');
                    $urls = [];

                    foreach ($images as $i => $base64) {
                        $imageData = base64_decode($base64);
                        $path = 'ai-images/' . now()->timestamp . "-{$i}.jpeg";
                        Storage::disk('public')->put($path, $imageData);
                        $urls[] = Storage::disk('public')->url($path);
                    }

                    return str('Generated ' . count($urls) . ' image(s):')
                        ->append("\n" . implode("\n", $urls));
                }
            },
        ];
    }
}
```
