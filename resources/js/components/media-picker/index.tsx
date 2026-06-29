import { router } from '@inertiajs/react';
import {
    Check,
    File,
    FileText,
    FileVideo,
    Image as ImageIcon,
    Loader2,
    Music,
    Search,
    Upload,
    Video as VideoIcon,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { list as mediaList, store as mediaStore } from '@/routes/media';

type MediaItem = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
    thumb_url: string;
};

type MediaKind = 'image' | 'video' | 'document';

type Props = {
    value: number | null;
    preview: string | null;
    fallbackInitials?: string;
    onChange: (mediaId: number | null, url?: string) => void;
    label?: string;
    /**
     * Which kind of media to show in the picker:
     *   - 'image'    → loads image/* mime types, opens a square grid
     *   - 'video'    → loads video/* mime types, shows a video element on hover
     *   - 'document' → loads ALL file types (PDF, DOC, ZIP, images, etc.) and
     *                  shows them as a list with mime-type-aware icons
     * Defaults to 'image'.
     */
    mediaKind?: MediaKind;
    hideUpload?: boolean;
    /** Force the upload accept attribute (overrides the kind default). */
    accept?: string;
    /** Cap the number of selected items when multi-select is enabled. */
    max?: number;
};

const COPY: Record<
    MediaKind,
    {
        title: string;
        description: string;
        chooseButton: string;
        uploadButton: string;
        emptyMessage: string;
        firstUploadButton: string;
        searchPlaceholder: string;
        helperText: string;
        accept: string;
    }
> = {
    image: {
        title: 'Biblioteca de imágenes',
        description: 'Seleccioná una imagen de la biblioteca.',
        chooseButton: 'Elegir imagen',
        uploadButton: 'Subir imagen',
        emptyMessage: 'No hay imágenes en la biblioteca.',
        firstUploadButton: 'Subir primera imagen',
        searchPlaceholder: 'Buscar imagen...',
        helperText:
            'Elegí una imagen existente de la biblioteca o subí una nueva.',
        accept: 'image/*',
    },
    video: {
        title: 'Biblioteca de videos',
        description: 'Seleccioná un video de la biblioteca.',
        chooseButton: 'Elegir video',
        uploadButton: 'Subir video',
        emptyMessage: 'No hay videos en la biblioteca.',
        firstUploadButton: 'Subir primer video',
        searchPlaceholder: 'Buscar video...',
        helperText:
            'Elegí un video existente de la biblioteca o subí uno nuevo.',
        accept: 'video/*',
    },
    document: {
        title: 'Biblioteca de archivos',
        description: 'Elegí un archivo de la biblioteca o subí uno nuevo.',
        chooseButton: 'Elegir archivo',
        uploadButton: 'Subir archivo',
        emptyMessage: 'No hay archivos en la biblioteca.',
        firstUploadButton: 'Subir primer archivo',
        searchPlaceholder: 'Buscar archivo...',
        helperText:
            'Elegí un archivo existente de la biblioteca o subí uno nuevo.',
        accept: '*/*',
    },
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function MediaPicker({
    value,
    preview,
    fallbackInitials,
    onChange,
    label = 'Archivo',
    mediaKind = 'image',
    hideUpload = false,
    accept,
    max = 1,
}: Props) {
    const copy = COPY[mediaKind];
    const acceptAttr = accept ?? copy.accept;
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const fileInput = useRef<HTMLInputElement | null>(null);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [searchInput, setSearchInput] = useState('');

    async function load(targetPage: number, term: string) {
        setLoading(true);

        try {
            const url = mediaList.url({
                query: {
                    // 'document' omits the type filter so the picker shows
                    // every kind (images, videos, PDFs, zips, ...).
                    type: mediaKind === 'document' ? '' : mediaKind,
                    search: term,
                    page: targetPage,
                },
            });

            const response = await fetch(url, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                setItems([]);
                setLastPage(1);

                return;
            }

            const data = await response.json();
            const list: MediaItem[] = (data?.data ?? []).map(
                (m: {
                    id: number;
                    name: string;
                    file_name: string;
                    mime_type: string;
                    size: number;
                    url: string;
                    thumb_url: string;
                }) => ({
                    id: m.id,
                    name: m.name,
                    file_name: m.file_name,
                    mime_type: m.mime_type,
                    size: m.size,
                    url: m.url,
                    thumb_url: m.thumb_url ?? m.url,
                }),
            );

            setItems(list);
            setLastPage(data?.last_page ?? 1);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            load(1, '');
        }
    }, [open, mediaKind]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (searchDebounce.current) {
            clearTimeout(searchDebounce.current);
        }

        searchDebounce.current = setTimeout(() => {
            setPage(1);
            load(1, searchInput);
        }, 300);

        return () => {
            if (searchDebounce.current) {
                clearTimeout(searchDebounce.current);
            }
        };
    }, [searchInput]);

    function selectItem(item: MediaItem) {
        onChange(item.id, item.url);
        setOpen(false);
    }

    function clearSelection() {
        onChange(null);
    }

    function handleUploadClick() {
        fileInput.current?.click();
    }

    function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setOpen(false);

        const formData = new FormData();
        formData.append('file', file);

        fetch(mediaStore().url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: formData,
        })
            .then((r) => r.json())
            .then((data) => {
                if (data?.id) {
                    onChange(data.id, data.url);
                }
            })
            .catch(() => {})
            .finally(() => {
                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            });
    }

    const TriggerIcon = mediaKind === 'video' ? VideoIcon : ImageIcon;

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-start gap-4">
                {preview ? (
                    mediaKind === 'video' ? (
                        <video
                            src={preview}
                            muted
                            playsInline
                            className="h-20 w-20 rounded-lg border bg-black object-cover"
                        />
                    ) : (
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={preview} alt={label} />
                            <AvatarFallback>
                                {fallbackInitials || (
                                    <ImageIcon className="h-6 w-6" />
                                )}
                            </AvatarFallback>
                        </Avatar>
                    )
                ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
                        <TriggerIcon className="h-6 w-6" />
                    </div>
                )}

                <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(true)}
                        >
                            <TriggerIcon className="mr-2 h-4 w-4" />
                            {copy.chooseButton}
                        </Button>
                        {!hideUpload && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleUploadClick}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {copy.uploadButton}
                            </Button>
                        )}
                        {value !== null && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearSelection}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Quitar
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {hideUpload
                            ? copy.helperText
                                  .replace(' o subí una nueva', '')
                                  .replace(' o subí uno nuevo', '')
                            : copy.helperText}
                    </p>
                </div>

                <input
                    ref={fileInput}
                    type="file"
                    accept={copy.accept}
                    className="hidden"
                    onChange={handleFileChosen}
                />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{copy.title}</DialogTitle>
                        <DialogDescription>
                            {copy.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder={copy.searchPlaceholder}
                            className="pl-9"
                        />
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {loading ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                                <TriggerIcon className="h-8 w-8 opacity-40" />
                                <p>{copy.emptyMessage}</p>
                                {!hideUpload && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleUploadClick}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {copy.firstUploadButton}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {items.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => selectItem(item)}
                                        className={`group relative flex aspect-video flex-col items-stretch overflow-hidden rounded-lg border-2 transition ${
                                            value === item.id
                                                ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                                                : 'border-transparent hover:border-primary/50'
                                        }`}
                                    >
                                        {mediaKind === 'video' ? (
                                            <video
                                                src={item.url}
                                                muted
                                                playsInline
                                                preload="metadata"
                                                className="h-full w-full bg-black object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={item.thumb_url}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 text-[11px] text-white">
                                            <span className="truncate font-medium">
                                                {item.name}
                                            </span>
                                            <span className="shrink-0 tabular-nums opacity-70">
                                                {formatBytes(item.size)}
                                            </span>
                                        </div>
                                        {mediaKind === 'video' && (
                                            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100">
                                                <FileVideo className="h-4 w-4" />
                                            </div>
                                        )}
                                        {value === item.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                                                <Check className="h-6 w-6 text-primary-foreground drop-shadow" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {lastPage > 1 && (
                        <div className="flex items-center justify-between border-t pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page <= 1 || loading}
                                onClick={() => {
                                    const next = page - 1;
                                    setPage(next);
                                    load(next, searchInput);
                                }}
                            >
                                Anterior
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Página {page} de {lastPage}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={page >= lastPage || loading}
                                onClick={() => {
                                    const next = page + 1;
                                    setPage(next);
                                    load(next, searchInput);
                                }}
                            >
                                Siguiente
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
