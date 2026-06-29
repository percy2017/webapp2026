import type { CustomField } from '@puckeditor/core';

export type ColorFieldProps = {
    value: string;
    onChange: (value: string) => void;
    field: { label?: string };
};

export function ColorField({ value, onChange, field }: ColorFieldProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border bg-background p-0.5"
                aria-label={field.label}
            />
            <input
                type="text"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 rounded border bg-background px-2 py-1 font-mono text-sm"
            />
        </div>
    );
}

export const colorField: CustomField<string> = {
    type: 'custom',
    render: (props) => <ColorField {...props} />,
};
