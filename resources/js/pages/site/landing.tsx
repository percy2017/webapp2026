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
                        const content = (section.content ??
                            {}) as SectionContent;
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
                        const Component = definition.component;
                        return (
                            <div
                                key={`block-${block.id}-${idx}`}
                                className="py-3"
                            >
                                <Component
                                    content={
                                        block.content as SectionContent
                                    }
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