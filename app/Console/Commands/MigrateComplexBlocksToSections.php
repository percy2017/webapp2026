<?php

namespace App\Console\Commands;

use App\Models\SiteTemplate;
use App\Models\SiteTemplateBlock;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Move pre-designed blocks (before-after, countdown, stats, schedule) from
 * the `site_template_blocks` table into the template's `sections` JSON
 * column, where they now belong. Idempotent: safe to re-run.
 */
#[Signature('app:migrate-complex-blocks-to-sections {--dry-run : Print changes without writing}')]
#[Description('Move before-after/countdown/stats/schedule blocks from site_template_blocks to the template sections JSON.')]
class MigrateComplexBlocksToSections extends Command
{
    /** Block types promoted from basic to pre-designed sections. */
    private const PROMOTED_TYPES = [
        'before-after',
        'countdown',
        'stats',
        'schedule',
        'gallery',
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $blocks = SiteTemplateBlock::query()
            ->whereIn('type', self::PROMOTED_TYPES)
            ->orderBy('site_template_id')
            ->orderBy('position')
            ->get();

        if ($blocks->isEmpty()) {
            $this->info('No blocks to migrate.');

            return self::SUCCESS;
        }

        // Group by template so we mutate each template's sections once.
        $byTemplate = $blocks->groupBy('site_template_id');

        $migrated = 0;
        foreach ($byTemplate as $templateId => $templateBlocks) {
            $template = SiteTemplate::query()->find($templateId);
            if (! $template) {
                $this->warn("Template #{$templateId} not found, skipping its blocks.");

                continue;
            }

            $existing = is_array($template->sections) ? $template->sections : [];

            // Preserve order: append promoted blocks after the existing
            // sections, in the same position order they had as blocks.
            $newSections = $existing;
            foreach ($templateBlocks as $block) {
                $newSections[] = [
                    'id' => $block->type,
                    'visible' => (bool) $block->visible,
                    'content' => is_array($block->content) ? $block->content : [],
                ];
            }

            if ($dryRun) {
                $this->line(sprintf(
                    '[dry-run] template #%d (%s): append %d section(s) → %s',
                    $template->id,
                    $template->slug,
                    $templateBlocks->count(),
                    implode(', ', $templateBlocks->pluck('type')->all()),
                ));
            } else {
                $template->sections = $newSections;
                $template->save();

                foreach ($templateBlocks as $block) {
                    $block->delete();
                }
                $migrated += $templateBlocks->count();

                $this->info(sprintf(
                    'Migrated %d block(s) into template #%d (%s): %s',
                    $templateBlocks->count(),
                    $template->id,
                    $template->slug,
                    implode(', ', $templateBlocks->pluck('type')->all()),
                ));
            }
        }

        if ($dryRun) {
            $this->info(sprintf('Dry run complete. %d block(s) would be migrated.', $blocks->count()));
        } else {
            $this->info(sprintf('Done. %d block(s) migrated.', $migrated));
        }

        return self::SUCCESS;
    }
}
