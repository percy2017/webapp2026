import { router } from '@inertiajs/react';
import { Check, Image as ImageIcon, Loader2, Search, Upload, X } from 'lucide-react';
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

type Props = {
    value: number | null;
    preview: string | null;
    fallbackInitials?: string;
    onChange: (mediaId: number | null, url?: string) => void;
    label?: string;
    hideUpload?: boolean;
};

export function MediaPicker({
    value,
    preview,
    fallbackInitials,
    onChange,
    label = 'Avatar',
    hideUpload = false,
}: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
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
                    type: 'image',
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
            const list: MediaItem[] = (data?.data ?? []).map((m: {
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
            }));

            setItems(list);
            setLastPage(data?.last_page ?? 1);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) load(1, search);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => {
            setPage(1);
            load(1, searchInput);
        }, 300);

        return () => {
            if (searchDebounce.current) clearTimeout(searchDebounce.current);
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
        if (!file) return;
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
                if (data?.id) onChange(data.id, data.url);
            })
            .catch(() => {})
            .finally(() => {
                if (fileInput.current) fileInput.current.value = '';
            });
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    {preview ? (
                        <AvatarImage src={preview} alt="avatar" />
                    ) : null}
                    <AvatarFallback>
                        {fallbackInitials || <ImageIcon className="h-6 w-6" />}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(true)}
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Elegir de medios
                        </Button>
                        {!hideUpload && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleUploadClick}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Subir nueva
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
                            ? 'Elegí una imagen existente de la biblioteca.'
                            : 'Elegí una imagen existente de la biblioteca o subí una nueva.'}
                    </p>
                </div>

                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChosen}
                />

                {value !== null && (
                    <input type="hidden" name="media_id" value={value} />
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Biblioteca de medios</DialogTitle>
                        <DialogDescription>
                            Seleccioná una imagen para usar como avatar.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar imagen..."
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
                                <ImageIcon className="h-8 w-8 opacity-40" />
                                <p>No hay imágenes en la biblioteca.</p>
                                {!hideUpload && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleUploadClick}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Subir primera imagen
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                                {items.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => selectItem(item)}
                                        className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                                            value === item.id
                                                ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                                                : 'border-transparent hover:border-primary/50'
                                        }`}
                                    >
                                        <img
                                            src={item.thumb_url}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
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