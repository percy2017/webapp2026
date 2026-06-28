import { Head, usePage } from '@inertiajs/react';
import { SiteLayout } from '@site/layouts/site-layout';
import {
    SECTION_REGISTRY,
    type SectionTheme,
    type SectionContent,
} from '@site/lib/template-registry';
import {
    BASIC_BLOCKS_REGISTRY,
    type BlockContent,
} from '@site/lib/basic-blocks-registry';

type SiteSettings = {
    site_name: string;
    site_tagline: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    contact_info: {
        email?: string;
        phone?: string;
        address?: string;
    };
    default_seo: {
        title?: string;
        description?: string;
    };
};

type TemplateSection = {
    id: string;
    visible: boolean;
    content: SectionContent;
};

type TemplateBlock = {
    id: string;
    type: string;
    visible: boolean;
    content: BlockContent;
};

type ActiveTemplate = {
    slug: string;
    name: string;
    sections: TemplateSection[];
    theme: SectionTheme;
} | null;

type Props = {
    template: ActiveTemplate;
    blocks: TemplateBlock[];
    settings: SiteSettings;
};

/**
 * Merge registry defaults with the section's persisted content so any
 * missing field (especially image_url / photo_url / image_url_thumb) still
 * renders the sample asset when the persisted content is incomplete.
 *
 * Rules:
 *   - Keys absent from `persisted` fall back to the default.
 *   - Keys present in `persisted` (including `null`) win.
 *   - Object values are merged recursively so an items[] array on the
 *     persisted side replaces the default array element-by-element.
 */
function mergeSectionContent(
    defaults: SectionContent | undefined,
    persisted: Record<string, unknown>,
): Record<string, unknown> {
    if (!defaults) return persisted;

    const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };

    for (const [key, value] of Object.entries(persisted)) {
        const existing = out[key];
        if (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            existing &&
            typeof existing === 'object' &&
            !Array.isArray(existing)
        ) {
            out[key] = mergeSectionContent(
                existing as SectionContent,
                value as Record<string, unknown>,
            );
        } else {
            out[key] = value;
        }
    }

    return out;
}

export default function SiteLanding({ template, settings }: Props) {
    const { props } = usePage<{
        template: ActiveTemplate;
        blocks: TemplateBlock[];
        settings: SiteSettings;
    }>();

    const tmpl = props.template;
    const blocks = props.blocks ?? [];
    const s = props.settings;

    const pageTitle = s.default_seo?.title || s.site_name;
    const pageDescription =
        s.default_seo?.description || s.site_tagline || '';

    const sections = (tmpl?.sections ?? []).filter((s) => s.visible !== false);
    const visibleBlocks = blocks.filter((b) => b.visible !== false);

    return (
        <SiteLayout>
            <Head title={pageTitle}>
                <meta name="description" content={pageDescription} />
                {s.favicon_url && (
                    <link rel="icon" href={s.favicon_url} />
                )}
            </Head>

            {sections.length === 0 &&
            visibleBlocks.length === 0 ? (
                <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {s.site_name}
                    </h1>
                    {s.site_tagline && (
                        <p className="text-lg text-muted-foreground">
                            {s.site_tagline}
                        </p>
                    )}
                    <p className="mt-4 text-sm text-muted-foreground">
                        Aún no hay contenido. Configuralo desde el panel de
                        administración.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {sections.map((section) => {
                        const definition = SECTION_REGISTRY[section.id];
                        if (!definition) return null;
                        // Merge defaults from registry into the section content
                        // so any missing field (e.g. image_url when a preset
                        // didn't persist it) still renders the sample asset.
                        const content = mergeSectionContent(
                            definition.defaultContent,
                            section.content ?? {},
                        ) as SectionContent;
                        if (definition.isEmpty?.(content)) return null;
                        const Component = definition.component;
                        return (
                            <Component
                                key={`section-${section.id}-${tmpl?.slug ?? 'none'}`}
                                content={content}
                                theme={tmpl?.theme ?? {}}
                            />
                        );
                    })}

                    {visibleBlocks.map((block, idx) => {
                        const definition = BASIC_BLOCKS_REGISTRY[block.type];
                        if (!definition) return null;
                        const content = mergeSectionContent(
                            definition.defaultContent,
                            block.content ?? {},
                        );
                        const Component = definition.component;
                        return (
                            <div
                                key={`block-${block.id}-${idx}`}
                                className="py-3"
                            >
                                <Component
                                    content={content as SectionContent}
                                    theme={tmpl?.theme ?? {}}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </SiteLayout>
    );
}