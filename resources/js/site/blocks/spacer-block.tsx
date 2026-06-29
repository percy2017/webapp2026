import type { BlockProps } from '@site/lib/basic-blocks-registry';

const HEIGHT_CLASSES = [
    'h-0',
    'h-4',
    'h-8',
    'h-12',
    'h-16',
    'h-20',
    'h-24',
    'h-32',
    'h-40',
    'h-48',
];

export function SpacerBlock({ content }: BlockProps) {
    const { height = 'h-16' } = content as { height?: string };
    const cls = HEIGHT_CLASSES.includes(height) ? height : 'h-16';

    return <div className={cls} aria-hidden />;
}
