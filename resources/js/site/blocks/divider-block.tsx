import type { BlockProps } from '@site/lib/basic-blocks-registry';

const STYLE_CLASS: Record<string, string> = {
    solid: 'border-border',
    dashed: 'border-dashed border-border',
    dotted: 'border-dotted border-border',
};

export function DividerBlock({ content }: BlockProps) {
    const { style = 'solid' } = content as { style?: string };
    const cls = STYLE_CLASS[style] ?? STYLE_CLASS.solid;

    return (
        <div className="mx-auto my-6 w-full max-w-5xl px-4 sm:my-8 sm:px-6 lg:px-8">
            <hr className={`border-t ${cls}`} />
        </div>
    );
}