<?php

namespace App\Console\Commands;

use App\Models\MediaHolder;
use Illuminate\Console\Command;

class RegisterLogoConceptsCommand extends Command
{
    protected $signature = 'media:register-logo-concepts {path=/tmp/logo-concepts}';

    protected $description = 'Register generated logo concept files into the media library.';

    public function handle(): int
    {
        $path = $this->argument('path');

        if (! is_dir($path)) {
            $this->error("Directory does not exist: {$path}");

            return self::FAILURE;
        }

        $files = glob($path.'/*.jpg');

        if (empty($files)) {
            $this->error("No .jpg files found in {$path}");

            return self::FAILURE;
        }

        $holder = MediaHolder::firstOrCreate(['name' => 'default']);

        $registered = 0;

        foreach ($files as $file) {
            $filename = basename($file);

            $existing = $holder->media()
                ->where('file_name', $filename)
                ->first();

            if ($existing) {
                $this->line("  - {$filename}: already registered (id={$existing->id})");

                continue;
            }

            $media = $holder
                ->addMedia($file)
                ->usingFileName('logo-concept-'.pathinfo($filename, PATHINFO_FILENAME).'.jpg')
                ->withCustomProperties([
                    'source' => 'minimax',
                    'category' => 'logo-concept',
                    'original_filename' => $filename,
                ])
                ->toMediaCollection();

            $this->info("  + {$filename}: registered as id={$media->id}");

            $registered++;
        }

        $this->info("Done. {$registered} new file(s) registered.");

        return self::SUCCESS;
    }
}
