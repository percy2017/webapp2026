import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Globe,
    ImageIcon,
    Link2,
    Loader2,
    Save,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MediaPicker } from '@/components/media-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import AppLayout from '@/layouts/app-layout';
import {
    edit as editRoute,
    update as updateRoute,
} from '@/routes/site-settings';
import type { BreadcrumbItem } from '@/types';

type Template = { slug: string; name: string };

type Settings = {
    id: number;
    site_name: string;
    site_tagline: string | null;
    logo_media_id: number | null;
    logo_url: string | null;
    favicon_media_id: number | null;
    favicon_url: string | null;
    pwa_short_name: string | null;
    pwa_description: string | null;
    pwa_theme_color: string | null;
    pwa_background_color: string | null;
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

type AssetSource = 'media' | 'url';

/**
 * Pick the source the operator was using last, so the form opens in
 * the mode they expect instead of always defaulting to "Media".
 *
 * Rule:
 *   - Anything saved to `*_url` (a /blocks/foo.svg, a CDN URL, an
 *     arbitrary https://...) is treated as "URL externa" mode.
 *   - Anything saved to `*_media_id` is treated as "Biblioteca" mode.
 *
 * Both can be filled at once (URL takes priority in the back-end
 * accessor), so we resolve by checking which one is non-empty first.
 */
function initialSource(mediaId: number | null, url: string | null): AssetSource {
    if (url && url.trim() !== '') {
        return 'url';
    }

    if (mediaId) {
        return 'media';
    }

    return 'url';
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Ajuste', href: '/admin/site-settings' },
];

/**
 * One Logo / Favicon row in /admin/site-settings. The operator chooses
 * between two sources:
 *
 *   - **Biblioteca media** — picks from the Spatie Media library via
 *     MediaPicker (uploads are also handled there). Stored on
 *     `*_media_id`.
 *   - **URL externa** — a free-form input for any URL the operator
 *     wants to point at: a `/blocks/foo.svg` shipped with the
 *     application, a CDN, a Dropbox link, etc. Stored on `*_url`.
 *
 * The SiteSetting accessor resolves `*_url` first, then `*_media_id`,
 * so exactly one path is active at any time. The preview shows the URL
 * the back-end will resolve to.
 */
function BrandAssetField({
    label,
    source,
    onSourceChange,
    preview,
    urlValue,
    onUrlChange,
    mediaId,
    onMediaChange,
    urlPlaceholder,
    errors,
    fieldPrefix,
}: {
    label: string;
    source: AssetSource;
    onSourceChange: (s: AssetSource) => void;
    preview: string | null;
    urlValue: string;
    onUrlChange: (v: string) => void;
    mediaId: number | null;
    onMediaChange: (id: number | null, url?: string) => void;
    urlPlaceholder: string;
    errors: Record<string, string>;
    fieldPrefix: 'logo' | 'favicon';
}) {
    const urlError = errors[`${fieldPrefix}_url`];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <Label>{label}</Label>
                <div className="inline-flex h-8 overflow-hidden rounded-md border bg-muted/40 p-0.5 text-xs">
                    <button
                        type="button"
                        onClick={() => onSourceChange('media')}
                        className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 transition ${
                            source === 'media'
                                ? 'bg-background shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <ImageIcon className="h-3.5 w-3.5" />
                        Biblioteca
                    </button>
                    <button
                        type="button"
                        onClick={() => onSourceChange('url')}
                        className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 transition ${
                            source === 'url'
                                ? 'bg-background shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Link2 className="h-3.5 w-3.5" />
                        URL externa
                    </button>
                </div>
            </div>

            <div className="flex items-start gap-4">
                {preview ? (
                    <Avatar
                        className={
                            fieldPrefix === 'favicon'
                                ? 'h-12 w-12 rounded-md'
                                : 'h-20 w-20'
                        }
                    >
                        <AvatarImage src={preview} alt={label} />
                        <AvatarFallback>
                            <ImageIcon className="h-6 w-6" />
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <div
                        className={`flex items-center justify-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground ${
                            fieldPrefix === 'favicon'
                                ? 'h-12 w-12 rounded-md'
                                : 'h-20 w-20'
                        }`}
                    >
                        <ImageIcon className="h-6 w-6" />
                    </div>
                )}

                <div className="flex-1">
                    {source === 'media' ? (
                        <MediaPicker
                            hideUpload
                            value={mediaId}
                            preview={
                                mediaId ? preview : null
                            }
                            onChange={onMediaChange}
                            label=""
                        />
                    ) : (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    value={urlValue}
                                    onChange={(e) =>
                                        onUrlChange(e.target.value)
                                    }
                                    placeholder={urlPlaceholder}
                                    maxLength={500}
                                    className="font-mono text-xs"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pegá una URL completa (
                                <code>https://…</code>) o una ruta servida
                                desde el proyecto (
                                <code>/blocks/milogo.svg</code>). Se respeta
                                exactamente lo que escribas.
                            </p>
                            {urlError && (
                                <p className="text-xs text-destructive">
                                    {urlError}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SiteSettingsEdit({ settings, templates }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const [siteName, setSiteName] = useState(settings.site_name);
    const [siteTagline, setSiteTagline] = useState(settings.site_tagline ?? '');

    // --- Logo state ----------------------------------------------------
    const [logoSource, setLogoSource] = useState<AssetSource>(
        initialSource(settings.logo_media_id, settings.logo_url),
    );
    const [logoMediaId, setLogoMediaId] = useState<number | null>(
        settings.logo_media_id,
    );
    const [logoUrlValue, setLogoUrlValue] = useState<string>(
        settings.logo_url ?? '',
    );
    // Effective preview used by the form — picks whichever source the
    // operator is currently editing so the thumbnail is always live.
    const logoPreview =
        logoSource === 'media'
            ? (settings.logo_media?.url ?? null)
            : logoUrlValue || null;

    // --- Favicon state -------------------------------------------------
    const [faviconSource, setFaviconSource] = useState<AssetSource>(
        initialSource(settings.favicon_media_id, settings.favicon_url),
    );
    const [faviconMediaId, setFaviconMediaId] = useState<number | null>(
        settings.favicon_media_id,
    );
    const [faviconUrlValue, setFaviconUrlValue] = useState<string>(
        settings.favicon_url ?? '',
    );
    const faviconPreview =
        faviconSource === 'media'
            ? (settings.favicon_media?.url ?? null)
            : faviconUrlValue || null;

    // --- PWA state -----------------------------------------------------
    const [pwaShortName, setPwaShortName] = useState(
        settings.pwa_short_name ?? '',
    );
    const [pwaDescription, setPwaDescription] = useState(
        settings.pwa_description ?? '',
    );
    const [pwaThemeColor, setPwaThemeColor] = useState(
        settings.pwa_theme_color ?? '#0f172a',
    );
    const [pwaBackgroundColor, setPwaBackgroundColor] = useState(
        settings.pwa_background_color ?? '#0f172a',
    );
    const [activeSlug, setActiveSlug] = useState(settings.active_template_slug);

    const seo = settings.default_seo ?? {};
    const [seoTitle, setSeoTitle] = useState(seo.title ?? '');
    const [seoDescription, setSeoDescription] = useState(seo.description ?? '');

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

        // Only the active source is persisted for each asset — when the
        // operator is on "URL externa" we null-out the media id, and
        // vice-versa, so the back-end accessor returns exactly what
        // they see in the preview.
        const payload: Record<string, unknown> = {
            site_name: siteName,
            site_tagline: siteTagline || null,
            logo_media_id: logoSource === 'media' ? logoMediaId : null,
            logo_url: logoSource === 'url' ? logoUrlValue.trim() || null : null,
            favicon_media_id:
                faviconSource === 'media' ? faviconMediaId : null,
            favicon_url:
                faviconSource === 'url' ? faviconUrlValue.trim() || null : null,
            pwa_short_name: pwaShortName || null,
            pwa_description: pwaDescription || null,
            pwa_theme_color: pwaThemeColor,
            pwa_background_color: pwaBackgroundColor,
            active_template_slug: activeSlug,
            default_seo: {
                title: seoTitle || null,
                description: seoDescription || null,
            },
        };

        router.patch(updateRoute().url, payload, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
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
                                <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
                                                setSeoDescription(
                                                    e.target.value,
                                                )
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
                                    Solo una página puede estar activa a la vez.
                                    Si la cambiás, el sitio público usará la
                                    nueva al instante.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Imágenes &amp; PWA</CardTitle>
                            <CardDescription>
                                Logo, favicon e identidad PWA del sitio. Esta
                                tarjeta es la fuente de verdad: lo que ves
                                acá se sirve en{' '}
                                <code>/manifest.webmanifest</code>, el ícono
                                del sidebar admin y el splash de "Agregar a
                                pantalla de inicio".
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <BrandAssetField
                                label="Logo"
                                source={logoSource}
                                onSourceChange={setLogoSource}
                                preview={logoPreview}
                                urlValue={logoUrlValue}
                                onUrlChange={setLogoUrlValue}
                                mediaId={logoMediaId}
                                onMediaChange={(id, url) => {
                                    setLogoMediaId(id);
                                    if (url) {
                                        // Mirror into the URL field so the
                                        // operator can copy the resolved
                                        // URL out of the form if needed.
                                        setLogoUrlValue(url);
                                    }
                                }}
                                urlPlaceholder="/blocks/logo-peluqueria.svg o https://cdn.example.com/logo.png"
                                errors={errors}
                                fieldPrefix="logo"
                            />
                            <BrandAssetField
                                label="Favicon"
                                source={faviconSource}
                                onSourceChange={setFaviconSource}
                                preview={faviconPreview}
                                urlValue={faviconUrlValue}
                                onUrlChange={setFaviconUrlValue}
                                mediaId={faviconMediaId}
                                onMediaChange={(id, url) => {
                                    setFaviconMediaId(id);
                                    if (url) {
                                        setFaviconUrlValue(url);
                                    }
                                }}
                                urlPlaceholder="/blocks/favicon-peluqueria.svg o https://cdn.example.com/favicon.svg"
                                errors={errors}
                                fieldPrefix="favicon"
                            />

                            <div className="space-y-3 border-t pt-4">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Identidad PWA
                                </p>
                                <div className="space-y-1.5">
                                    <Label htmlFor="pwa_short_name">
                                        Short name
                                    </Label>
                                    <Input
                                        id="pwa_short_name"
                                        value={pwaShortName}
                                        maxLength={32}
                                        onChange={(e) =>
                                            setPwaShortName(e.target.value)
                                        }
                                        placeholder="ej. Hostbol"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="pwa_description">
                                        Descripción
                                    </Label>
                                    <Input
                                        id="pwa_description"
                                        value={pwaDescription}
                                        maxLength={240}
                                        onChange={(e) =>
                                            setPwaDescription(e.target.value)
                                        }
                                        placeholder="ej. Tarjeta digital editable"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pwa_theme_color">
                                            Theme color
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="pwa_theme_color"
                                                type="color"
                                                value={pwaThemeColor}
                                                onChange={(e) =>
                                                    setPwaThemeColor(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-9 w-10 cursor-pointer rounded border"
                                            />
                                            <Input
                                                value={pwaThemeColor}
                                                onChange={(e) =>
                                                    setPwaThemeColor(
                                                        e.target.value,
                                                    )
                                                }
                                                maxLength={9}
                                                className="flex-1 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pwa_background_color">
                                            Background color
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="pwa_background_color"
                                                type="color"
                                                value={pwaBackgroundColor}
                                                onChange={(e) =>
                                                    setPwaBackgroundColor(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-9 w-10 cursor-pointer rounded border"
                                            />
                                            <Input
                                                value={pwaBackgroundColor}
                                                onChange={(e) =>
                                                    setPwaBackgroundColor(
                                                        e.target.value,
                                                    )
                                                }
                                                maxLength={9}
                                                className="flex-1 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
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
