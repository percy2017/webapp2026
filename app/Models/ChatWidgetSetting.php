<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property bool $enabled
 * @property string $position
 */
#[Fillable(['enabled', 'position'])]
class ChatWidgetSetting extends Model
{
    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'enabled' => true,
                'position' => 'bottom-right',
            ]
        );
    }
}
