import { ImageIcon } from 'lucide-react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const ASPECT_CLASS: Record<string, string> = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
};

function normalizeMediaField(value: unknown): {
    id: number | null;
    url: string | null;
} {
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
    const {
        source = 'url',
        image_media_id,
        image_url,
        url,
        alt = '',
        aspect = 'auto',
        rounded = false,
    } = content as {
        source?: 'url' | 'media';
        image_media_id?: unknown;
        image_url?: unknown;
        url?: string;
        alt?: string;
        aspect?: string;
        rounded?: boolean;
    };

    // Resolve the rendered URL based on the user's "Fuente" toggle.
    let directUrl: string | null = null;

    if (source === 'media') {
        const media =
            typeof image_media_id === 'object' && image_media_id !== null
                ? normalizeMediaField(image_media_id)
                : { id: null, url: null };

        directUrl =
            media.url ??
            (typeof image_url === 'string' ? image_url : null) ??
            null;
    } else {
        // source === 'url' — accept either `url` (canonical) or `image_url`
        // (legacy / section compatibility).
        const candidate =
            typeof url === 'string' && url.length > 0
                ? url
                : typeof image_url === 'string'
                  ? image_url
                  : '';

        directUrl = candidate.length > 0 ? candidate : null;
    }

    if (!directUrl) {
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
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div
                className={`overflow-hidden ${radiusCls} bg-muted ${aspectCls}`}
            >
                <img
                    src={directUrl}
                    alt={alt}
                    className={`h-full w-full object-cover ${radiusCls}`}
                />
            </div>
        </div>
    );
}