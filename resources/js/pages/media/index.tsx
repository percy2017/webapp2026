import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Check,
    Copy,
    Download,
    ExternalLink,
    File,
    FileAudio,
    FileText,
    FileVideo,
    Image as ImageIcon,
    Loader2,
    Search,
    Trash2,
    Sparkles,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { generate, index, store, destroy } from '@/routes/media';
import type { Paginated } from '@/types';

type MediaItem = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    disk: string;
    url: string;
    thumb_url?: string;
    width?: number | null;
    height?: number | null;
    created_at: string;
    collection_name?: string;
    model_type?: string;
};

type Filters = {
    search: string;
    type: string;
};

type Props = {
    media: Paginated<MediaItem>;
    filters: Filters;
};

function getIcon(mime: string) {
    if (mime.startsWith('image/')) {
        return ImageIcon;
    }

    if (mime.startsWith('video/')) {
        return FileVideo;
    }

    if (mime.startsWith('audio/')) {
        return FileAudio;
    }

    if (
        mime.startsWith('text/') ||
        mime.includes('pdf') ||
        mime.includes('document')
    ) {
        return FileText;
    }

    return File;
}

function formatSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mime: string) {
    return mime.startsWith('image/');
}

function isVideo(mime: string) {
    return mime.startsWith('video/');
}

function isAudio(mime: string) {
    return mime.startsWith('audio/');
}

function isPdf(mime: string) {
    return mime === 'application/pdf';
}

function isText(mime: string) {
    return (
        mime.startsWith('text/') ||
        mime.includes('json') ||
        mime.includes('xml')
    );
}

function modelLabel(model?: string) {
    if (!model) {
        return '—';
    }

    if (model.includes('MediaHolder')) {
        return 'Biblioteca';
    }

    if (model.includes('User')) {
        return 'Avatares';
    }

    return model.split('\\').pop() ?? model;
}

export default function MediaIndex({ media, filters }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const [search, setSearch] = useState(filters.search);
    const [type, setType] = useState(filters.type || 'all');
    const [isSearching, setIsSearching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState<MediaItem | null>(null);
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const firstRender = useRef(true);

    function applyFilters(next?: Partial<{ search: string; type: string }>) {
        const params: Record<string, string> = {};
        const s = next?.search ?? search;
        const t = next?.type ?? type;

        if (s) {
            params.search = s;
        }

        if (t && t !== 'all') {
            params.type = t;
        }

        setIsSearching(true);
        router.get(index(), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['media', 'filters'],
            onFinish: () => setIsSearching(false),
        });
    }

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            applyFilters();
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search]);

    function handleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const file = fileInput.current?.files?.[0];

        if (!file) {
            return;
        }

        setUploading(true);
        router.post(
            store(),
            { file },
            {
                forceFormData: true,
                onFinish: () => {
                    setUploading(false);
                    setOpen(false);

                    if (fileInput.current) {
                        fileInput.current.value = '';
                    }
                },
            },
        );
    }

    function confirmDelete() {
        if (!deleting) {
            return;
        }

        router.delete(destroy(deleting.id), {
            onFinish: () => {
                setDeleting(null);

                if (selected?.id === deleting.id) {
                    setSelected(null);
                }
            },
        });
    }

    async function copyUrl(url: string) {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* noop */
        }
    }

    return (
        <>
            <Head title="Medios" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pr-20 pl-9"
                        />
                        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                            {isSearching && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {search && !isSearching && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <Select
                        value={type}
                        onValueChange={(v) => {
                            setType(v);
                            applyFilters({ type: v });
                        }}
                    >
                        <SelectTrigger className="sm:w-48">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="image">Imágenes</SelectItem>
                            <SelectItem value="video">Videos</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="application">
                                Documentos
                            </SelectItem>
                            <SelectItem value="text">Texto</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button asChild variant="secondary">
                        <Link href={generate().url}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generar imagen
                        </Link>
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Upload className="mr-2 h-4 w-4" />
                                Subir archivo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Subir nuevo archivo</DialogTitle>
                                <DialogDescription>
                                    Tamaño máximo 10 MB.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpload}>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Archivo</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            ref={fileInput}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={uploading}>
                                        {uploading && (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        )}
                                        Subir
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {media.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                        <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No hay archivos. Sube el primero con el botón
                            superior.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {media.data.map((item) => {
                            const Icon = getIcon(item.mime_type);
                            const isSelected = selected?.id === item.id;

                            return (
                                <Card
                                    key={item.id}
                                    className={`group cursor-pointer overflow-hidden transition-all hover:shadow-md ${
                                        isSelected ? 'ring-2 ring-primary' : ''
                                    }`}
                                    onClick={() => setSelected(item)}
                                >
                                    <div className="relative aspect-square bg-muted">
                                        {isImage(item.mime_type) ? (
                                            <img
                                                src={item.thumb_url ?? item.url}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Icon className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleting(item);
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <CardContent className="p-3">
                                        <p
                                            className="truncate text-xs font-medium"
                                            title={item.file_name}
                                        >
                                            {item.file_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatSize(item.size)}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {media.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {media.links?.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link
                                    href={link.url ?? '#'}
                                    preserveState
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <Sheet
                open={selected !== null}
                onOpenChange={(o) => !o && setSelected(null)}
            >
                <SheetContent
                    side="right"
                    className="flex w-full flex-col gap-0 sm:max-w-md"
                >
                    {selected && (
                        <>
                            <SheetHeader>
                                <SheetTitle
                                    className="truncate pr-8"
                                    title={selected.file_name}
                                >
                                    {selected.file_name}
                                </SheetTitle>
                                <SheetDescription>
                                    {modelLabel(selected.model_type)} ·{' '}
                                    {selected.collection_name ?? 'default'}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto px-4 pb-4">
                                <div className="overflow-hidden rounded-lg border bg-muted">
                                    {isImage(selected.mime_type) ? (
                                        <img
                                            src={selected.url}
                                            alt={selected.name}
                                            className="max-h-72 w-full object-contain"
                                        />
                                    ) : isVideo(selected.mime_type) ? (
                                        <video
                                            src={selected.url}
                                            controls
                                            preload="metadata"
                                            className="max-h-72 w-full"
                                        >
                                            Tu navegador no soporta el elemento
                                            de video.
                                        </video>
                                    ) : isAudio(selected.mime_type) ? (
                                        <div className="flex flex-col items-center gap-3 p-6">
                                            {(() => {
                                                const Icon = getIcon(
                                                    selected.mime_type,
                                                );

                                                return (
                                                    <Icon className="h-16 w-16 text-muted-foreground" />
                                                );
                                            })()}
                                            <audio
                                                src={selected.url}
                                                controls
                                                preload="metadata"
                                                className="w-full"
                                            >
                                                Tu navegador no soporta el
                                                elemento de audio.
                                            </audio>
                                        </div>
                                    ) : isPdf(selected.mime_type) ? (
                                        <div className="flex flex-col items-center gap-3 p-6">
                                            {(() => {
                                                const Icon = getIcon(
                                                    selected.mime_type,
                                                );

                                                return (
                                                    <Icon className="h-16 w-16 text-muted-foreground" />
                                                );
                                            })()}
                                            <a
                                                href={selected.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Abrir PDF en pestaña nueva
                                            </a>
                                        </div>
                                    ) : isText(selected.mime_type) ? (
                                        <div className="flex flex-col items-center gap-3 p-6">
                                            {(() => {
                                                const Icon = getIcon(
                                                    selected.mime_type,
                                                );

                                                return (
                                                    <Icon className="h-16 w-16 text-muted-foreground" />
                                                );
                                            })()}
                                            <a
                                                href={selected.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Abrir archivo de texto
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="flex h-48 items-center justify-center">
                                            {(() => {
                                                const Icon = getIcon(
                                                    selected.mime_type,
                                                );

                                                return (
                                                    <Icon className="h-16 w-16 text-muted-foreground" />
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 space-y-3 text-sm">
                                    <DetailRow
                                        label="Tipo"
                                        value={selected.mime_type}
                                    />
                                    <DetailRow
                                        label="Tamaño"
                                        value={formatSize(selected.size)}
                                    />
                                    {selected.width && selected.height && (
                                        <DetailRow
                                            label="Dimensiones"
                                            value={`${selected.width} × ${selected.height} px`}
                                        />
                                    )}
                                    <DetailRow
                                        label="Colección"
                                        value={
                                            selected.collection_name ??
                                            'default'
                                        }
                                    />
                                    <DetailRow
                                        label="Origen"
                                        value={modelLabel(selected.model_type)}
                                    />
                                    <DetailRow
                                        label="Subido"
                                        value={new Date(
                                            selected.created_at,
                                        ).toLocaleString('es')}
                                    />

                                    <div className="space-y-1.5">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            URL pública
                                        </p>
                                        <div className="flex gap-1.5">
                                            <Input
                                                readOnly
                                                value={selected.url}
                                                className="font-mono text-xs"
                                                onClick={(e) =>
                                                    e.currentTarget.select()
                                                }
                                            />
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    copyUrl(selected.url)
                                                }
                                                aria-label="Copiar URL"
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border-t bg-background p-4">
                                <Button asChild className="flex-1">
                                    <a
                                        href={selected.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Abrir
                                    </a>
                                </Button>
                                <Button asChild variant="outline">
                                    <a
                                        href={selected.url}
                                        download={selected.file_name}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar
                                    </a>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setDeleting(selected)}
                                    aria-label="Eliminar"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Eliminar archivo"
                description={`¿Estás seguro de eliminar "${deleting?.file_name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            <span className="text-right text-sm font-medium" title={value}>
                {value}
            </span>
        </div>
    );
}

MediaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Medios',
            href: index(),
        },
    ],
};
