<?php

namespace App\Http\Controllers;

use App\Http\Requests\Media\GenerateImageRequest;
use App\Http\Requests\Media\StoreMediaRequest;
use App\Models\MediaHolder;
use App\Services\MinimaxImageService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $type = $request->string('type')->toString();

        $media = $this->buildQuery($request)
            ->paginate(24)
            ->withQueryString();

        $media->getCollection()->transform(function (Media $item) {
            $item->url = $item->getUrl();
            $item->thumb_url = $item->hasGeneratedConversion('thumb')
                ? $item->getUrl('thumb')
                : $item->getUrl();

            $item->width = null;
            $item->height = null;
            if (str_starts_with($item->mime_type, 'image/')) {
                $path = $item->getPath();
                if (is_file($path)) {
                    $info = @getimagesize($path);
                    if ($info) {
                        $item->width = $info[0];
                        $item->height = $info[1];
                    }
                }
            }

            return $item;
        });

        return Inertia::render('media/index', [
            'media' => $media,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
        ]);
    }

    public function generate(): Response
    {
        return Inertia::render('media/generate');
    }

    public function generateStore(
        GenerateImageRequest $request,
        MinimaxImageService $minimax,
    ) {
        $result = $minimax->generate(
            prompt: $request->input('prompt'),
            aspectRatio: $request->input('aspect_ratio', '1:1'),
            n: (int) $request->input('n', 1),
            promptOptimizer: (bool) $request->input('prompt_optimizer', false),
            seed: $request->input('seed') ? (int) $request->input('seed') : null,
            referenceImage: $request->file('reference_image'),
        );

        $holder = $this->getHolder();

        $generated = [];
        foreach ($result['images'] as $i => $base64) {
            $imageContent = base64_decode($base64);
            $media = $holder
                ->addMediaFromString($imageContent)
                ->usingFileName(sprintf(
                    'generated-%s-%d.jpeg',
                    now()->format('Ymd-His'),
                    $i + 1,
                ))
                ->toMediaCollection();

            $generated[] = $media;
        }

        return redirect()->route('media.index')
            ->with('success', sprintf(
                'Imagen%s generada%s correctamente.',
                count($generated) > 1 ? 's' : '',
                count($generated) > 1 ? 's' : '',
            ));
    }

    public function listJson(Request $request): JsonResponse
    {
        $media = $this->buildQuery($request)
            ->paginate(24)
            ->withQueryString();

        $media->getCollection()->transform(function (Media $item) {
            $item->url = $item->getUrl();
            $item->thumb_url = $item->hasGeneratedConversion('thumb')
                ? $item->getUrl('thumb')
                : $item->getUrl();

            return $item;
        });

        return response()->json($media);
    }

    private function buildQuery(Request $request): Builder
    {
        $search = $request->string('search')->toString();
        $type = $request->string('type')->toString();

        return Media::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('file_name', 'like', "%{$search}%");
                });
            })
            ->when($type !== '', function ($query) use ($type) {
                $query->where('mime_type', 'like', "{$type}%");
            })
            ->latest();
    }

    public function store(StoreMediaRequest $request)
    {
        $holder = $this->getHolder();
        $media = $holder->addMediaFromRequest('file')->toMediaCollection();

        if ($request->wantsJson()) {
            return response()->json([
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'url' => $media->getUrl(),
                'thumb_url' => $media->hasGeneratedConversion('thumb')
                    ? $media->getUrl('thumb')
                    : $media->getUrl(),
            ]);
        }

        return back()->with('success', 'Archivo subido correctamente.');
    }

    public function destroy(Media $medium)
    {
        $medium->delete();

        return back()->with('success', 'Archivo eliminado.');
    }

    private function getHolder(): MediaHolder
    {
        return MediaHolder::firstOrCreate(['name' => 'default']);
    }
}
