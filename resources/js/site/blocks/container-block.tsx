import type { ReactNode } from 'react';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

type ContainerProps = BlockProps & {
    /** Puck DropZone to render nested children. Injected by puck-config. */
    children?: ReactNode;
};

const LAYOUT_CLASS: Record<string, string> = {
    stack: 'flex flex-col',
    row: 'flex flex-col sm:flex-row',
    'row-reverse': 'flex flex-col-reverse sm:flex-row-reverse',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

const ALIGN_CLASS: Record<string, string> = {
    start: 'items-start justify-start',
    center: 'items-center justify-center',
    end: 'items-end justify-end',
    between: 'items-center justify-between',
    stretch: 'items-stretch justify-stretch',
};

const GAP_CLASS: Record<string, string> = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-10',
    xl: 'gap-10 sm:gap-16',
};

const PADDING_CLASS: Record<string, string> = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-10 lg:p-16',
    xl: 'p-8 sm:p-14 lg:p-24',
};

const BG_CLASS: Record<string, string> = {
    transparent: 'bg-transparent',
    background: 'bg-background',
    card: 'bg-card',
    muted: 'bg-muted',
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-primary/10 text-foreground',
};

const RADIUS_CLASS: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-md',
    md: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-3xl',
};

const BORDER_CLASS: Record<string, string> = {
    none: 'border-0',
    light: 'border border-border',
    primary: 'border-2 border-primary/30',
};

const MAX_WIDTH_CLASS: Record<string, string> = {
    full: 'max-w-none',
    prose: 'max-w-prose',
    screen: 'max-w-screen-2xl',
    container: 'max-w-7xl',
    narrow: 'max-w-4xl',
};

export function ContainerBlock({ content, children }: ContainerProps) {
    const {
        layout = 'stack',
        align = 'stretch',
        gap = 'md',
        padding = 'none',
        background = 'transparent',
        radius = 'none',
        border = 'none',
        max_width = 'full',
        min_height = 'none',
    } = content as {
        layout?: keyof typeof LAYOUT_CLASS;
        align?: keyof typeof ALIGN_CLASS;
        gap?: keyof typeof GAP_CLASS;
        padding?: keyof typeof PADDING_CLASS;
        background?: keyof typeof BG_CLASS;
        radius?: keyof typeof RADIUS_CLASS;
        border?: keyof typeof BORDER_CLASS;
        max_width?: keyof typeof MAX_WIDTH_CLASS;
        min_height?: 'none' | 'sm' | 'md' | 'lg' | 'screen';
    };

    const layoutCls = LAYOUT_CLASS[layout] ?? LAYOUT_CLASS.stack;
    const alignCls = ALIGN_CLASS[align] ?? ALIGN_CLASS.stretch;
    const gapCls = GAP_CLASS[gap] ?? GAP_CLASS.md;
    const paddingCls = PADDING_CLASS[padding] ?? PADDING_CLASS.none;
    const bgCls = BG_CLASS[background] ?? BG_CLASS.transparent;
    const radiusCls = RADIUS_CLASS[radius] ?? RADIUS_CLASS.none;
    const borderCls = BORDER_CLASS[border] ?? BORDER_CLASS.none;
    const maxWidthCls = MAX_WIDTH_CLASS[max_width] ?? MAX_WIDTH_CLASS.full;

    const minHeightCls =
        min_height === 'screen'
            ? 'min-h-screen'
            : min_height === 'lg'
              ? 'min-h-[60vh]'
              : min_height === 'md'
                ? 'min-h-[40vh]'
                : min_height === 'sm'
                  ? 'min-h-[20vh]'
                  : '';

    return (
        <div
            className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${paddingCls} ${bgCls} ${minHeightCls}`}
        >
            <div
                className={`mx-auto w-full ${maxWidthCls} ${layoutCls} ${alignCls} ${gapCls} ${radiusCls} ${borderCls}`}
            >
                {children}
            </div>
        </div>
    );
}