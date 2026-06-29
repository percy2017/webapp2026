import type { BlockProps } from '@site/lib/basic-blocks-registry';

const ALIGN_CLASS: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

const LEVEL_CLASS: Record<string, string> = {
    h1: 'text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl',
    h2: 'text-3xl font-bold tracking-tight sm:text-4xl',
    h3: 'text-2xl font-bold tracking-tight sm:text-3xl',
    h4: 'text-xl font-bold tracking-tight sm:text-2xl',
};

export function HeadingBlock({ content }: BlockProps) {
    const {
        text,
        level = 'h2',
        align = 'left',
    } = content as {
        text?: string;
        level?: string;
        align?: string;
    };

    if (!text) {
        return null;
    }

    const Tag = (level as keyof JSX.IntrinsicElements) || 'h2';
    const cls = `${LEVEL_CLASS[level] ?? LEVEL_CLASS.h2} ${ALIGN_CLASS[align] ?? ''}`;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Tag className={cls.trim()}>{text}</Tag>
        </div>
    );
}
