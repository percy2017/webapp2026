<?php

namespace App\Http\Controllers;

use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * QR generator for public pages.
 *
 * Routes:
 *   GET /qr.svg?u=<url>&size=<px>   → SVG (default 320px, 1024 max)
 *   GET /qr.png?u=<url>&size=<px>   → PNG via GD (default 320px, 1024 max)
 *   GET /qr/download?u=<url>        → PNG download (filename: tarjeta-qr.png)
 *
 * If `u` is missing, falls back to the current request URL — so embedding
 * `<img src="/qr.svg">` on any page generates a QR for that page automatically.
 */
class QrController extends Controller
{
    private const MAX_SIZE = 1024;

    private const MIN_SIZE = 96;

    public function svg(Request $request): Response
    {
        [$text, $size] = $this->resolve($request);

        $renderer = new ImageRenderer(
            new RendererStyle($size, 1),
            new SvgImageBackEnd,
        );

        $writer = new Writer($renderer);
        $svg = $writer->writeString($text);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=300',
        ]);
    }

    public function png(Request $request): Response
    {
        [$text, $size] = $this->resolve($request);

        $renderer = new GDLibRenderer($size);
        $writer = new Writer($renderer);
        $png = $writer->writeString($text);

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=300',
        ]);
    }

    public function download(Request $request): Response
    {
        [$text, $size] = $this->resolve($request, defaultSize: 720);

        $renderer = new GDLibRenderer($size);
        $writer = new Writer($renderer);
        $png = $writer->writeString($text);

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'attachment; filename="tarjeta-qr.png"',
            'Cache-Control' => 'public, max-age=300',
        ]);
    }

    /**
     * @return array{0: string, 1: int}
     */
    private function resolve(Request $request, int $defaultSize = 320): array
    {
        $explicit = $request->query('u');
        $text = is_string($explicit) && $explicit !== ''
            ? $explicit
            : $request->fullUrl();

        $size = (int) $request->query('size', $defaultSize);
        $size = max(self::MIN_SIZE, min(self::MAX_SIZE, $size ?: $defaultSize));

        return [$text, $size];
    }
}
