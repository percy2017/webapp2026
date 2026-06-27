import { ImageIcon } from 'lucide-react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const ASPECT_CLASS: Record<string, string> = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
};

function normalizeMediaField(value: unknown): { id: number | null; url: string | null } {
    if (value && typeof value === 'object' && 'id' in value) {
        const obj = value as { id: unknown; url?: unknown };
        return {
            id: typeof obj.id === 'number' ? obj.id : null,
            url: typeof obj.url === 'string' ? obj.url : null,
        };
    }
    return { id: null, url: null };
}

export function ImageBlock({ content }: BlockProps) {
    const rawId = content.image_media_id;
    const media =
        typeof rawId === 'object'
            ? normalizeMediaField(rawId)
            : { id: null, url: null };

    const id = media.id ?? (typeof rawId === 'number' ? rawId : null);
    const directUrl =
        media.url ??
        (typeof content.image_url === 'string'
            ? (content.image_url as string)
            : null);

    const { alt = '', aspect = 'auto', rounded = false } = content as {
        alt?: string;
        aspect?: string;
        rounded?: boolean;
    };

    if (!id && !directUrl) {
        return (
            <div className="mx-auto flex aspect-video w-full max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                <ImageIcon className="mb-2 h-8 w-8" />
                Elegí una imagen desde el panel derecho.
            </div>
        );
    }

    const aspectCls = ASPECT_CLASS[aspect] ?? '';
    const radiusCls = rounded ? 'rounded-xl' : '';

    return (
        <div
            className={`overflow-hidden ${radiusCls} bg-muted ${aspectCls}`}
        >
            {directUrl ? (
                <img
                    src={directUrl}
                    alt={alt}
                    className={`h-full w-full object-cover ${radiusCls}`}
                />
            ) : null}
        </div>
    );
}