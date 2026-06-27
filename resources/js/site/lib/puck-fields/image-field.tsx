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

function ImageFieldRender({ value, onChange }: ImageFieldRenderProps) {
    const normalized = normalize(value);

    return (
        <div className="space-y-2">
            <MediaPicker
                value={normalized.id}
                preview={normalized.url}
                onChange={(id, url) => {
                    onChange({ id, url: url ?? null });
                }}
                hideUpload
            />
            {normalized.id !== null && (
                <p className="text-xs text-muted-foreground">
                    Media ID: {normalized.id}
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
        />
    ),
};