import { Button } from '@/components/ui/button';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const VARIANT_MAP: Record<string, 'default' | 'outline' | 'ghost'> = {
    solid: 'default',
    outline: 'outline',
    ghost: 'ghost',
};

const SIZE_MAP: Record<string, 'sm' | 'default' | 'lg'> = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
};

const ALIGN_CLASS: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

const ALIGN_CONTAINER: Record<string, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
};

export function ButtonBlock({ content, theme }: BlockProps) {
    const {
        label = '',
        href = '#',
        variant = 'solid',
        size = 'md',
        align = 'left',
    } = content as {
        label?: string;
        href?: string;
        variant?: string;
        size?: string;
        align?: string;
    };

    if (!label) {
        return null;
    }

    const primaryColor = theme?.primary_color;
    const isSolid = variant === 'solid';

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div
                className={`flex ${ALIGN_CONTAINER[align] ?? 'justify-start'} ${ALIGN_CLASS[align] ?? ''}`}
            >
                <Button
                    asChild
                    variant={VARIANT_MAP[variant] ?? 'default'}
                    size={SIZE_MAP[size] ?? 'default'}
                    style={
                        isSolid && primaryColor
                            ? {
                                  backgroundColor: primaryColor,
                                  borderColor: primaryColor,
                              }
                            : undefined
                    }
                >
                    <a href={href}>{label}</a>
                </Button>
            </div>
        </div>
    );
}
