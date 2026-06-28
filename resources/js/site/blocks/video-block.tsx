import { PlayCircle, Video as VideoIcon } from 'lucide-react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const RADIUS_CLASS: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    xl: 'rounded-xl',
};

const ASPECT_CLASS: Record<string, string> = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    tall: 'aspect-[9/16]',
};

function parseYoutube(input: string): string | null {
    const url = input.trim();
    if (!url) return null;

    if (url.includes('youtube.com/embed/')) {
        const id = url.split('embed/')[1]?.split(/[?&]/)[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split(/[?&]/)[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    const match = url.match(/youtube\.com\/watch\?v=([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    return null;
}

function parseVimeo(input: string): string | null {
    const url = input.trim();
    if (!url) return null;

    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;

    return null;
}

function isDirectVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function resolveVideo(rawUrl: string): {
    type: 'youtube' | 'vimeo' | 'file' | 'unknown';
    embedUrl: string | null;
    fileUrl: string | null;
} {
    const url = rawUrl.trim();
    if (!url) return { type: 'unknown', embedUrl: null, fileUrl: null };

    const yt = parseYoutube(url);
    if (yt) return { type: 'youtube', embedUrl: yt, fileUrl: null };

    const vimeo = parseVimeo(url);
    if (vimeo) return { type: 'vimeo', embedUrl: vimeo, fileUrl: null };

    if (isDirectVideo(url)) return { type: 'file', embedUrl: null, fileUrl: url };

    return { type: 'unknown', embedUrl: null, fileUrl: null };
}

function resolveMediaField(value: unknown): string | null {
    if (value && typeof value === 'object' && 'url' in value) {
        const obj = value as { url?: unknown };
        if (typeof obj.url === 'string') return obj.url;
    }
    if (typeof value === 'string') return value;
    return null;
}

export function VideoBlock({ content }: BlockProps) {
    const {
        source = 'url',
        url = '',
        media_id = null,
        title = '',
        autoplay = false,
        controls = true,
        loop = false,
        muted = false,
        aspect = 'video',
        radius = 'xl',
    } = content as {
        source?: 'url' | 'media';
        url?: string;
        media_id?: unknown;
        title?: string;
        autoplay?: boolean;
        controls?: boolean;
        loop?: boolean;
        muted?: boolean;
        aspect?: string;
        radius?: string;
    };

    const aspectCls = ASPECT_CLASS[aspect] ?? ASPECT_CLASS['video'];
    const radiusCls = RADIUS_CLASS[radius] ?? RADIUS_CLASS['xl'];

    const rawUrl =
        source === 'media' ? (resolveMediaField(media_id) ?? '') : url;
    const video = resolveVideo(rawUrl);

    if (video.type === 'unknown' || (!video.embedUrl && !video.fileUrl)) {
        return (
            <div
                className={`mx-auto flex w-full max-w-2xl flex-col items-center justify-center border-2 border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground ${aspectCls} ${radiusCls}`}
            >
                <VideoIcon className="mb-2 h-8 w-8" />
                Pegá una URL de YouTube, Vimeo o archivo .mp4
            </div>
        );
    }

    if (video.type === 'file' && video.fileUrl) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className={`overflow-hidden bg-black ${radiusCls} ${aspectCls}`}>
                    <video
                        src={video.fileUrl}
                        title={title || undefined}
                        autoPlay={autoplay}
                        controls={controls}
                        loop={loop}
                        muted={autoplay || muted}
                        playsInline
                        className="h-full w-full"
                    />
                </div>
            </div>
        );
    }

    const embedSrc = video.embedUrl;
    if (!embedSrc) return null;

    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (!controls) params.set('controls', '0');
    if (loop) params.set('loop', '1');
    if (muted) params.set('muted', '1');
    const query = params.toString();
    const finalSrc = query ? `${embedSrc}?${query}` : embedSrc;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className={`overflow-hidden bg-black ${radiusCls} ${aspectCls}`}>
                <iframe
                    src={finalSrc}
                    title={title || 'Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                />
            </div>
        </div>
    );
}