import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MediaPicker } from '@/components/media-picker';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { edit as editRoute, update as updateRoute } from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';

type Template = { slug: string; name: string };

type Settings = {
    id: number;
    site_name: string;
    site_tagline: string | null;
    logo_media_id: number | null;
    favicon_media_id: number | null;
    active_template_slug: string | null;
    default_seo: {
        title?: string;
        description?: string;
    };
    logo_media: { id: number; url: string; thumb_url?: string } | null;
    favicon_media: { id: number; url: string; thumb_url?: string } | null;
};

type Props = {
    settings: Settings;
    templates: Template[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Ajuste', href: '/admin/site-settings' },
];

export default function SiteSettingsEdit({ settings, templates }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const [siteName, setSiteName] = useState(settings.site_name);
    const [siteTagline, setSiteTagline] = useState(settings.site_tagline ?? '');
    const [logoMediaId, setLogoMediaId] = useState<number | null>(
        settings.logo_media_id,
    );
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.logo_media?.url ?? null,
    );
    const [faviconMediaId, setFaviconMediaId] = useState<number | null>(
        settings.favicon_media_id,
    );
    const [faviconPreview, setFaviconPreview] = useState<string | null>(
        settings.favicon_media?.url ?? null,
    );
    const [activeSlug, setActiveSlug] = useState(settings.active_template_slug);

    const seo = settings.default_seo ?? {};
    const [seoTitle, setSeoTitle] = useState(seo.title ?? '');
    const [seoDescription, setSeoDescription] = useState(
        seo.description ?? '',
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});

        if (activeSlug === null && settings.active_template_slug !== null) {
            setConfirmDeactivate(true);
            return;
        }

        doSubmit();
    }

    function doSubmit() {
        setProcessing(true);
        router.patch(
            updateRoute().url,
            {
                site_name: siteName,
                site_tagline: siteTagline || null,
                logo_media_id: logoMediaId,
                favicon_media_id: faviconMediaId,
                active_template_slug: activeSlug,
                default_seo: {
                    title: seoTitle || null,
                    description: seoDescription || null,
                },
            },
            {
                preserveScroll: true,
                onError: (errs) => setErrors(errs as Record<string, string>),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Ajuste" />

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
            >
                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identidad y SEO</CardTitle>
                            <CardDescription>
                                Nombre, eslogan, meta tags y página activa.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="site_name">Nombre</Label>
                                <Input
                                    id="site_name"
                                    value={siteName}
                                    onChange={(e) =>
                                        setSiteName(e.target.value)
                                    }
                                    required
                                />
                                {errors.site_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.site_name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="site_tagline">Eslogan</Label>
                                <Textarea
                                    id="site_tagline"
                                    value={siteTagline}
                                    onChange={(e) =>
                                        setSiteTagline(e.target.value)
                                    }
                                    rows={2}
                                />
                            </div>
                            <div className="border-t pt-4">
                                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    SEO por defecto
                                </p>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="seo_title">
                                            Título SEO
                                        </Label>
                                        <Input
                                            id="seo_title"
                                            value={seoTitle}
                                            onChange={(e) =>
                                                setSeoTitle(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seo_description">
                                            Descripción SEO
                                        </Label>
                                        <Textarea
                                            id="seo_description"
                                            value={seoDescription}
                                            onChange={(e) =>
                                                setSeoDescription(e.target.value)
                                            }
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 border-t pt-4">
                                <Label htmlFor="active_template">
                                    Página activa
                                </Label>
                                <select
                                    id="active_template"
                                    value={activeSlug ?? ''}
                                    onChange={(e) =>
                                        setActiveSlug(
                                            e.target.value === ''
                                                ? null
                                                : e.target.value,
                                        )
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">(ninguna)</option>
                                    {templates.map((t) => (
                                        <option key={t.slug} value={t.slug}>
                                            {t.name} (/{t.slug})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Solo una página puede estar activa a la
                                    vez. Si la cambiás, el sitio público usará
                                    la nueva al instante.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Imágenes</CardTitle>
                            <CardDescription>
                                Logo y favicon del sitio.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <MediaPicker
                                label="Logo"
                                hideUpload
                                value={logoMediaId}
                                preview={logoPreview}
                                onChange={(id, url) => {
                                    setLogoMediaId(id);
                                    setLogoPreview(url ?? null);
                                }}
                            />
<MediaPicker
                            label="Favicon"
                            hideUpload
                            value={faviconMediaId}
                            preview={faviconPreview}
                            onChange={(id, url) => {
                                setFaviconMediaId(id);
                                setFaviconPreview(url ?? null);
                            }}
                        />
                    </CardContent>
                </Card>
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-4">
                    <Button asChild variant="outline">
                        <Link href="/admin">Volver</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Guardar
                    </Button>
                </div>
            </form>

            <ConfirmDialog
                open={confirmDeactivate}
                onOpenChange={(open) => !open && setConfirmDeactivate(false)}
                title="Desactivar página"
                description="El sitio público quedará sin página activa. ¿Continuar?"
                confirmLabel="Desactivar"
                onConfirm={() => {
                    setConfirmDeactivate(false);
                    doSubmit();
                }}
            />
        </>
    );
}

SiteSettingsEdit.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);