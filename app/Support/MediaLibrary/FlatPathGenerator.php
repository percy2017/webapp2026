<?php

namespace App\Support\MediaLibrary;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

class FlatPathGenerator implements PathGenerator
{
    public function getPath(Media $media): string
    {
        return '';
    }

    public function getPathForConversions(Media $media): string
    {
        return 'conversions/';
    }

    public function getPathForResponsiveImages(Media $media): string
    {
        return 'responsive/';
    }
}
