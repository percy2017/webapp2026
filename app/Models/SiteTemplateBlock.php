<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteTemplateBlock extends Model
{
    use HasFactory;

    protected $table = 'site_template_blocks';

    protected $fillable = [
        'site_template_id',
        'type',
        'content',
        'visible',
        'position',
    ];

    protected $casts = [
        'content' => 'array',
        'visible' => 'boolean',
        'position' => 'integer',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(SiteTemplate::class, 'site_template_id');
    }
}
