import '@puckeditor/core/puck.css';

import { Head, router } from '@inertiajs/react';
import { Puck } from '@puckeditor/core';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { update as updateRoute } from '@/routes/site-templates';
import { buildPuckConfig } from '@site/lib/puck-config';
import {
    puckDataToSplit,
    sectionsToPuckData,
    type PuckData,
} from '@site/lib/puck-adapter';
import type { SectionTheme } from '@site/lib/template-registry';
import type { BreadcrumbItem } from '@/types';

type ThumbnailMedia = { id: number; url: string } | null;

type Props = {
    template: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        thumbnail_media_id: number | null;
        thumbnail_media: ThumbnailMedia;
        is_active: boolean;
        sections: Array<{
            id: string;
            visible: boolean;
            content: Record<string, unknown>;
        }>;
        blocks: Array<{
            id: number;
            type: string;
            visible: boolean;
            content: Record<string, unknown>;
        }>;
        theme: SectionTheme;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Páginas', href: '/admin/site-templates' },
    { title: 'Editar', href: '#' },
];

export default function SiteTemplateEdit({ template }: Props) {
    const initialData: PuckData = useMemo(
        () =>
            sectionsToPuckData(
                (template.sections ?? []).map((s) => ({
                    id: s.id,
                    visible: s.visible !== false,
                    content: (s.content ?? {}) as Record<string, unknown>,
                })),
                (template.blocks ?? []).map((b) => ({
                    id: b.type,
                    type: b.type,
                    visible: b.visible !== false,
                    content: (b.content ?? {}) as Record<string, unknown>,
                    block_db_id: b.id,
                })),
            ),
        [template],
    );

    const config = useMemo(
        () =>
            buildPuckConfig({
                theme: {
                    primary_color:
                        template.theme?.primary_color ?? '#3b82f6',
                    accent_color:
                        template.theme?.accent_color ?? '#10b981',
                },
            }),
        [template.theme],
    );

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handlePublish(data: PuckData) {
        setProcessing(true);
        setError(null);

        const { sections, blocks } = puckDataToSplit(data);

        router.patch(
            updateRoute(template.id).url,
            {
                name: template.name,
                slug: template.slug,
                description: template.description,
                thumbnail_media_id: template.thumbnail_media_id,
                sections,
                blocks,
                theme: {
                    primary_color: template.theme?.primary_color,
                    accent_color: template.theme?.accent_color,
                },
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setError(null);
                },
                onError: (errors) => {
                    setError(
                        'Error al guardar: ' +
                            Object.values(errors).flat().join(', '),
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title={`Editar ${template.name}`} />

            <div className="px-2 py-2 sm:px-4 sm:py-3">
                {error && (
                    <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        {error}
                    </div>
                )}

                <Puck
                    config={config}
                    data={initialData}
                    onPublish={handlePublish}
                />
            </div>
        </>
    );
}

SiteTemplateEdit.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);