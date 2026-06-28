import type { CustomField } from '@puckeditor/core';
import { MediaPicker } from '@/components/media-picker';

export type ImageFieldValue = {
    id: number | null;
    url: string | null;
};

type ImageFieldRenderProps = {
    value: unknown;
    onChange: (value: ImageFieldValue) => void;
};

function normalize(value: unknown): ImageFieldValue {
    if (value && typeof value === 'object' && 'id' in value) {
        const v = value as { id: unknown; url: unknown };
        return {
            id: typeof v.id === 'number' ? v.id : null,
            url: typeof v.url === 'string' ? v.url : null,
        };
    }
    if (typeof value === 'number') {
        return { id: value, url: null };
    }
    return { id: null, url: null };
}

/**
 * Puck custom field for picking from the Media library.
 *
 * By default it filters `image/*` mime types. Pass `mediaKind="video"` in
 * `field.config` to use it for the Video block's `media_id` field — that
 * way the picker, upload accept filter, and grid previews all switch to
 * video.
 */
function ImageFieldRender({
    value,
    onChange,
    config,
}: ImageFieldRenderProps & {
    config?: { mediaKind?: 'image' | 'video'; label?: string };
}) {
    const normalized = normalize(value);
    const mediaKind = config?.mediaKind ?? 'image';
    const label = config?.label ?? 'Imagen';

    return (
        <div className="space-y-2">
            <MediaPicker
                value={normalized.id}
                preview={normalized.url}
                onChange={(id, url) => {
                    onChange({ id, url: url ?? null });
                }}
                label={label}
                mediaKind={mediaKind}
                hideUpload
            />
            {normalized.id !== null && (
                <p className="text-xs text-muted-foreground">
                    ID: {normalized.id}
                </p>
            )}
        </div>
    );
}

export const imageField: CustomField<ImageFieldValue> = {
    type: 'custom',
    render: (props) => (
        <ImageFieldRender
            value={props.value}
            onChange={(v) => props.onChange(v)}
            config={props.field?.config as
                | { mediaKind?: 'image' | 'video'; label?: string }
                | undefined}
        />
    ),
};