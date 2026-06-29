import type { ReactNode } from 'react';
import { BASIC_BLOCKS_REGISTRY } from '@site/lib/basic-blocks-registry';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

type ContainerProps = BlockProps & {
    /**
     * Puck v0.22+ pasa los campos del array field (`columns`) como
     * prop top-level del componente en el editor de Puck — ver
     * https://puckeditor.com/docs/api-reference/fields/array y
     * https://puckeditor.com/docs/integrating-puck/multi-column-layouts
     *
     * Cada item es:
     *   - **Editor**: `{ content: SlotComponent }` — función que
     *     renderea el DropZone interno.
     *   - **Preview público** (landing): los items viven dentro de
     *     `content.columns` como `{ content: ComponentData[] }`
     *     plano, porque el sitio público renderiza con el `content`
     *     persistido en DB, no vía el render del Config.
     */
    columns?: Array<{
        content?: (() => ReactNode) | unknown[] | undefined;
    }>;
};

const PADDING_CLASS: Record<string, string> = {
    none: 'py-0',
    sm: 'py-6',
    md: 'py-10 sm:py-12',
    lg: 'py-14 sm:py-16 lg:py-20',
};

const MAX_WIDTH_CLASS: Record<string, string> = {
    full: 'max-w-none',
    container: 'max-w-6xl',
    narrow: 'max-w-3xl',
};

const BG_CLASS: Record<string, string> = {
    transparent: 'bg-transparent',
    background: 'bg-background',
    muted: 'bg-muted/40',
    card: 'bg-card',
};

// Gaps más compactos. Las cards internas ya tienen padding propio,
// por eso no necesitamos gap grande entre ellas. `sm` (8-12px) es
// el sweet spot entre "apegadas" y "amontonadas".
const GAP_CLASS: Record<string, string> = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6',
};

/**
 * Renderiza los bloques hijos de una columna en el preview público
 * a partir del array plano persistido por Puck en `content.columns`.
 */
function RenderColumnItems({ items }: { items: unknown[] }) {
    return (
        <>
            {items.map((rawItem, idx) => {
                const item = rawItem as {
                    type?: string;
                    props?: Record<string, unknown>;
                };

                if (!item?.type) {
                    return null;
                }

                const definition = BASIC_BLOCKS_REGISTRY[item.type];

                if (!definition) {
                    return null;
                }

                const Inner = definition.component;
                const innerContent = (item.props ??
                    {}) as BlockProps['content'];

                return (
                    <Inner
                        key={`inner-${item.type}-${idx}`}
                        content={innerContent}
                    />
                );
            })}
        </>
    );
}

/**
 * Contenedor vertical con columnas agregables. Sigue el patrón
 * canónico de Puck v0.22+ para multi-column layouts (cada item del
 * array field lleva un sub-field `type: 'slot'`). El operator
 * gestiona las columnas con los botones + y × built-in de Puck.
 *
 * Recibe `columns` como prop top-level en el editor (donde el
 * `SlotComponent` está disponible para renderear el DropZone) y
 * como `content.columns` en el preview público (donde los items
 * ya están aplanados como ComponentData en la DB).
 */
export function ContainerBlock(props: ContainerProps) {
    // `columns` puede llegar como prop top-level (editor) o vivir
    // dentro de `content.columns` (preview público). Tomamos la
    // primera fuente no-vacía.
    const topColumns = props.columns ?? [];
    const contentColumns = (
        props.content as { columns?: typeof topColumns } | undefined
    )?.columns;
    const columns =
        topColumns.length > 0 ? topColumns : (contentColumns ?? []);

    const {
        padding = 'md',
        background = 'transparent',
        max_width = 'container',
        gap = 'md',
    } = (props.content ?? {}) as {
        padding?: keyof typeof PADDING_CLASS;
        background?: keyof typeof BG_CLASS;
        max_width?: keyof typeof MAX_WIDTH_CLASS;
        gap?: keyof typeof GAP_CLASS;
    };

    const paddingCls = PADDING_CLASS[padding] ?? PADDING_CLASS.md;
    const bgCls = BG_CLASS[background] ?? BG_CLASS.transparent;
    const maxWidthCls = MAX_WIDTH_CLASS[max_width] ?? MAX_WIDTH_CLASS.container;
    const gapCls = GAP_CLASS[gap] ?? GAP_CLASS.md;

    return (
        <section className={`w-full ${bgCls} ${paddingCls}`}>
            <div
                className={`mx-auto flex w-full flex-col px-4 sm:px-6 lg:px-8 ${maxWidthCls} ${gapCls}`}
            >
                {columns.map((column, idx) => {
                    const raw = column.content;

                    // Cada columna ocupa una fila completa (`basis-full`).
                    // Las columnas se apilan verticalmente dentro del
                    // contenedor; el operator las gestiona con los
                    // botones + y × de Puck sobre el array field
                    // `columns`. El gap entre columnas lo controla
                    // `gapCls` arriba.
                    const basis = 'basis-full';

                    // Editor de Puck: `content` es SlotComponent
                    // (función) que renderea el DropZone. La
                    // invocamos como <Content />.
                    if (typeof raw === 'function') {
                        const Content = raw;

                        return (
                            <div
                                key={`col-${idx}`}
                                className={`flex shrink-0 grow flex-col ${basis}`}
                            >
                                <Content />
                            </div>
                        );
                    }

                    // Preview público: `content` es array plano
                    // persistido en DB. Resolvemos cada item con
                    // BASIC_BLOCKS_REGISTRY.
                    if (Array.isArray(raw)) {
                        return (
                            <div
                                key={`col-${idx}`}
                                className={`flex shrink-0 grow flex-col ${basis}`}
                            >
                                <RenderColumnItems items={raw} />
                            </div>
                        );
                    }

                    // Columna vacía.
                    return (
                        <div
                            key={`col-${idx}`}
                            className={`flex shrink-0 grow flex-col ${basis}`}
                        />
                    );
                })}
            </div>
        </section>
    );
}
