<?php

namespace App\Console\Commands;

use App\Models\MediaHolder;
use Illuminate\Console\Command;

class RegisterPeluqueriaCanvasCommand extends Command
{
    protected $signature = 'media:register-peluqueria-canvas {path=public/canvas/peluqueria}';

    protected $description = 'Register the 13 simulated SVG assets for the peluquería preset into the media library.';

    public function handle(): int
    {
        $path = $this->argument('path');

        if (! is_dir($path)) {
            $this->error("Directory does not exist: {$path}");

            return self::FAILURE;
        }

        $files = glob($path.'/*.svg');

        if (empty($files)) {
            $this->error("No .svg files found in {$path}");

            return self::FAILURE;
        }

        $holder = MediaHolder::firstOrCreate(['name' => 'peluqueria-canvas']);

        $registered = 0;
        $skipped = 0;

        foreach ($files as $file) {
            $filename = basename($file);

            $existing = $holder->media()
                ->where('file_name', $filename)
                ->first();

            if ($existing) {
                $this->line("  - {$filename}: already registered (id={$existing->id})");
                $skipped++;

                continue;
            }

            $media = $holder
                ->addMedia($file)
                ->usingFileName($filename)
                ->withCustomProperties([
                    'source' => 'canvas-design',
                    'category' => 'peluqueria-canvas',
                    'preset' => 'peluqueria',
                ])
                ->toMediaCollection();

            $this->info("  + {$filename}: registered as id={$media->id}");

            $registered++;
        }

        $this->info("Done. {$registered} new file(s) registered, {$skipped} already present.");

        return self::SUCCESS;
    }
}
