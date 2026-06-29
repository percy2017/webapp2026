import {
    Check,
    File,
    FileText,
    Image as ImageIcon,
    Loader2,
    Music,
    Paperclip,
    Search,
    Upload,
    Video as VideoIcon,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

type Props = {
    /** Already-selected media items (drives both the chip list and the dialog). */
    selected: MediaItem[];
    onChange: (items: MediaItem[]) => void;
    /** Max number of items that can be selected (default 5). */
    max?: number;
    /** Accept attribute on the upload input (default: images + common docs). */
    accept?: string;
    label?: string;
    /**
     * When true, the picker renders only the dialog — no chip list, no
     * trigger button. The caller must control `open` / `onOpenChange` and
     * render its own trigger (e.g. an icon button inline with a textarea).
     */
    hideTrigger?: boolean;
    /** Controlled open state for the dialog. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

const DEFAULT_ACCEPT =
    'image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar,.csv,.json';

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

function iconForMime(mime: string) {
    if (mime.startsWith('image/')) {
        return ImageIcon;
    }

    if (mime.startsWith('video/')) {
        return VideoIcon;
    }

    if (mime.startsWith('audio/')) {
        return Music;
    }

    if (mime === 'application/pdf' || mime.startsWith('text/')) {
        return FileText;
    }

    return File;
}

function thumbForMime(item: MediaItem): string | null {
    if (item.mime_type.startsWith('image/')) {
        return item.thumb_url;
    }

    return null;
}

export function MediaAttachmentsPicker({
    selected,
    onChange,
    max = 5,
    accept = DEFAULT_ACCEPT,
    label = 'Adjuntar archivos',
    hideTrigger = false,
    open: openProp,
    onOpenChange,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : internalOpen;
    const setOpen = (value: boolean) => {
        if (!isControlled) {
            setInternalOpen(value);
        }

        onOpenChange?.(value);
    };
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef<HTMLInputElement | null>(null);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selectedIds = new Set(selected.map((s) => s.id));
    const atCap = selected.length >= max;

    async function load(targetPage: number, term: string) {
        setLoading(true);

        try {
            const url = mediaList.url({
                query: { search: term, page: targetPage },
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
    }, [open]);

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

    function toggleItem(item: MediaItem) {
        if (selectedIds.has(item.id)) {
            onChange(selected.filter((s) => s.id !== item.id));

            return;
        }

        if (atCap) {
            return;
        }

        onChange([...selected, item]);
    }

    function removeItem(id: number) {
        onChange(selected.filter((s) => s.id !== id));
    }

    function handleUploadClick() {
        fileInput.current?.click();
    }

    async function handleFilesChosen(files: FileList | null) {
        if (!files || files.length === 0) {
            return;
        }

        setUploading(true);

        try {
            const incoming = Array.from(files).slice(0, max - selected.length);

            for (const file of incoming) {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(mediaStore().url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                    body: formData,
                });

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();

                if (data?.id) {
                    const next: MediaItem = {
                        id: data.id,
                        name: data.name,
                        file_name: data.file_name,
                        mime_type: data.mime_type,
                        size: data.size,
                        url: data.url,
                        thumb_url: data.thumb_url ?? data.url,
                    };
                    onChange([...selected, next].slice(0, max));
                }
            }

            // Refresh the list so newly uploaded items appear next time
            // the modal is reopened.
            load(page, searchInput);
        } catch {
            // ignore
        } finally {
            setUploading(false);

            if (fileInput.current) {
                fileInput.current.value = '';
            }

            // Close the modal so the user sees their chip in the composer
            // and can immediately hit Send. Reopen if they need more files.
            setOpen(false);
        }
    }

    return (
        <div className="space-y-2">
            <input
                ref={fileInput}
                type="file"
                accept={accept}
                multiple
                className="hidden"
                onChange={(e) => handleFilesChosen(e.target.files)}
            />

            {!hideTrigger && (
                <>
                    {selected.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selected.map((item) => {
                                const Icon = iconForMime(item.mime_type);
                                const thumb = thumbForMime(item);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-2 rounded-md border bg-muted/40 py-1 pr-1.5 pl-1 text-xs"
                                    >
                                        {thumb ? (
                                            <img
                                                src={thumb}
                                                alt={item.name}
                                                className="h-7 w-7 rounded object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-7 w-7 items-center justify-center rounded bg-background">
                                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                            </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="max-w-[160px] truncate font-medium">
                                                {item.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatBytes(item.size)}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            aria-label={`Quitar ${item.name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(true)}
                        disabled={atCap}
                        title={atCap ? `Máximo ${max} archivos` : label}
                    >
                        <Paperclip className="mr-2 h-4 w-4" />
                        {label}
                        {selected.length > 0 && (
                            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                                {selected.length}/{max}
                            </span>
                        )}
                    </Button>
                </>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Biblioteca de archivos</DialogTitle>
                        <DialogDescription>
                            Elegí hasta {max} archivos de la biblioteca o subí
                            nuevos.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Buscar archivo..."
                                className="pl-9"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleUploadClick}
                            disabled={uploading || atCap}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? 'Subiendo...' : 'Subir archivo'}
                        </Button>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {loading ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Paperclip className="h-8 w-8 opacity-40" />
                                <p>No hay archivos en la biblioteca.</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUploadClick}
                                    disabled={uploading || atCap}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Subir primer archivo
                                </Button>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {items.map((item) => {
                                    const Icon = iconForMime(item.mime_type);
                                    const thumb = thumbForMime(item);
                                    const checked = selectedIds.has(item.id);
                                    const disabled = !checked && atCap;

                                    return (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => toggleItem(item)}
                                                disabled={disabled}
                                                className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                    checked
                                                        ? 'bg-accent/60'
                                                        : ''
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                                        checked
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-border bg-background'
                                                    }`}
                                                >
                                                    {checked && (
                                                        <Check className="h-3.5 w-3.5" />
                                                    )}
                                                </span>
                                                {thumb ? (
                                                    <img
                                                        src={thumb}
                                                        alt={item.name}
                                                        className="h-10 w-10 shrink-0 rounded object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {item.mime_type} ·{' '}
                                                        {formatBytes(item.size)}
                                                    </p>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
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
