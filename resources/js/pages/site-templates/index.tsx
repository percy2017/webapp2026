import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ExternalLink,
    Loader2,
    Pencil,
    Plus,
    ScanQrCode,
    Settings,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    activate as activateRoute,
    destroy as destroyRoute,
    edit as editRoute,
    index as indexRoute,
    update as updateRoute,
} from '@/routes/site-templates';
import type { BreadcrumbItem } from '@/types';
import { QrShareButton } from '@site/components/qr-share-button';

type SiteTemplate = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sections_count: number;
    blocks_count: number;
    theme: {
        primary_color?: string;
        accent_color?: string;
    };
};

type Props = {
    templates: {
        data: SiteTemplate[];
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Plantillas', href: '/admin/site-templates' },
];

export default function SiteTemplatesIndex({ templates }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const [deleting, setDeleting] = useState<SiteTemplate | null>(null);
    const [activatingId, setActivatingId] = useState<number | null>(null);
    const [editing, setEditing] = useState<SiteTemplate | null>(null);

    /**
     * Public URL for a template.
     *
     * - If the template is the active one, the public site resolves it at
     *   the root `/` (HomeController falls back to `SiteSetting::active_template_slug`).
     * - Otherwise (inactive), we point at the explicit preview URL
     *   `/?template=<slug>` so admins can still open that specific page.
     *
     * Built from the current origin so the QR works regardless of where
     * the admin runs.
     */
    function publicUrlFor(slug: string, isActive: boolean): string {
        const path = isActive ? '/' : `/?template=${encodeURIComponent(slug)}`;

        if (typeof window === 'undefined') {
            return path;
        }

        const { origin } = window.location;

        return `${origin}${path}`;
    }

    function handleActivate(template: SiteTemplate) {
        setActivatingId(template.id);
        router.post(activateRoute(template.id).url, undefined, {
            preserveScroll: true,
            onFinish: () => setActivatingId(null),
        });
    }

    function handleDelete() {
        if (!deleting) {
            return;
        }

        router.delete(destroyRoute(deleting.id).url, {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    }

    return (
        <>
            <Head title="Páginas" />

            <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Páginas del sitio
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestioná las páginas disponibles para tu sitio
                            público. Una sola puede estar activa a la vez.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={`${indexRoute().url}/create`} prefetch>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva página
                        </Link>
                    </Button>
                </div>

                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                {templates.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            No hay páginas todavía. Creá la primera.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={`${indexRoute().url}/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva página
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-card">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/40 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Página</th>
                                    <th className="hidden px-4 py-3 sm:table-cell">
                                        Slug
                                    </th>
                                    <th className="hidden px-4 py-3 md:table-cell">
                                        Contenido
                                    </th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3">QR público</th>
                                    <th className="px-4 py-3 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {templates.data.map((template) => {
                                    const primary =
                                        template.theme?.primary_color;

                                    return (
                                        <tr
                                            key={template.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {primary && (
                                                        <span
                                                            className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-border"
                                                            style={{
                                                                backgroundColor:
                                                                    primary,
                                                            }}
                                                            aria-hidden
                                                        />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold">
                                                            {template.name}
                                                        </p>
                                                        {template.description && (
                                                            <p className="line-clamp-1 text-xs text-muted-foreground">
                                                                {
                                                                    template.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">
                                                /{template.slug}
                                            </td>
                                            <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                                                {template.sections_count}{' '}
                                                secciones
                                                {template.blocks_count > 0 && (
                                                    <>
                                                        {' · '}
                                                        {
                                                            template.blocks_count
                                                        }{' '}
                                                        bloques
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {template.is_active ? (
                                                    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                                        Activa
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                        Inactiva
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {template.is_active ? (
                                                    <div className="flex items-center gap-1">
                                                        <QrShareButton
                                                            url={publicUrlFor(
                                                                template.slug,
                                                                true,
                                                            )}
                                                            variant="inline"
                                                            label="Ver QR"
                                                        />
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Abrir página pública"
                                                            aria-label="Abrir página pública"
                                                        >
                                                            <a
                                                                href={publicUrlFor(
                                                                    template.slug,
                                                                    true,
                                                                )}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex h-8 w-8 items-center justify-center"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground italic"
                                                        title="Activá esta página para generar su QR"
                                                    >
                                                        <ScanQrCode className="h-3 w-3" />
                                                        Inactiva
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={
                                                                editRoute(
                                                                    template.id,
                                                                ).url
                                                            }
                                                            prefetch
                                                            className="inline-flex h-8 w-8 items-center justify-center"
                                                            title="Editar"
                                                            aria-label="Editar"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setEditing(template)
                                                        }
                                                    >
                                                        <Settings className="h-3.5 w-3.5" />
                                                        <span className="sr-only">
                                                            Configuración
                                                        </span>
                                                    </Button>
                                                    {!template.is_active && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleActivate(
                                                                    template,
                                                                )
                                                            }
                                                            disabled={
                                                                activatingId ===
                                                                template.id
                                                            }
                                                        >
                                                            {activatingId ===
                                                                template.id && (
                                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                            )}
                                                            Activar
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setDeleting(
                                                                template,
                                                            )
                                                        }
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span className="sr-only">
                                                            Eliminar
                                                        </span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Eliminar página"
                description={
                    deleting?.is_active
                        ? `«${deleting?.name}» está activa. Si la eliminás, el sitio quedará sin página activa.`
                        : `¿Eliminar la página «${deleting?.name}»? Esta acción no se puede deshacer.`
                }
                confirmLabel="Eliminar"
                onConfirm={handleDelete}
            />

            <TemplateSettingsDialog
                template={editing}
                onClose={() => setEditing(null)}
            />
        </>
    );
}

function TemplateSettingsDialog({
    template,
    onClose,
}: {
    template: SiteTemplate | null;
    onClose: () => void;
}) {
    const [name, setName] = useState(template?.name ?? '');
    const [slug, setSlug] = useState(template?.slug ?? '');
    const [description, setDescription] = useState(template?.description ?? '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (template) {
            setName(template.name ?? '');
            setSlug(template.slug ?? '');
            setDescription(template.description ?? '');
            setErrors({});
        }
    }, [template?.id]);

    if (!template) {
        return null;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        router.patch(
            updateRoute(template!.id).url,
            {
                name,
                slug,
                description,
            },
            {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: (errs) => setErrors(errs as Record<string, string>),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Configuración — {template.name}</DialogTitle>
                    <DialogDescription>
                        Datos básicos. El contenido se edita en "Editar".
                    </DialogDescription>
                </DialogHeader>

                <form
                    id={`template-settings-${template.id}`}
                    onSubmit={handleSubmit}
                    className="grid gap-4 py-2"
                >
                    <div className="space-y-2">
                        <Label htmlFor={`name-${template.id}`}>Nombre</Label>
                        <Input
                            id={`name-${template.id}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`slug-${template.id}`}>Slug</Label>
                        <Input
                            id={`slug-${template.id}`}
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                        />
                        {errors.slug && (
                            <p className="text-xs text-destructive">
                                {errors.slug}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`description-${template.id}`}>
                            Descripción
                        </Label>
                        <Textarea
                            id={`description-${template.id}`}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>
                </form>

                {Object.keys(errors).length > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        Revisá los campos marcados.
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        form={`template-settings-${template.id}`}
                        disabled={processing}
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

SiteTemplatesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
