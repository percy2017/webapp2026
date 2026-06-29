import type { Config, Fields } from '@puckeditor/core';
import type React from 'react';
import { BASIC_BLOCKS_REGISTRY } from '@site/lib/basic-blocks-registry';
import type { BlockContent } from '@site/lib/basic-blocks-registry';
import { iconField } from '@site/lib/puck-fields/icon-field';
import { imageField } from '@site/lib/puck-fields/image-field';
import type {
    ContentField,
    SectionContent,
    SectionTheme,
} from '@site/lib/template-registry';
import { SECTION_REGISTRY } from '@site/lib/template-registry';

type Props = {
    theme: SectionTheme;
};

function normalizeImageContent(
    content: Record<string, unknown>,
): Record<string, unknown> {
    const result = { ...content };
    const value = content.image_media_id;

    if (value && typeof value === 'object' && 'id' in value) {
        const obj = value as { id: unknown; url: unknown };
        result.image_media_id = typeof obj.id === 'number' ? obj.id : null;

        if (typeof obj.url === 'string') {
            result.image_url = obj.url;
        }
    }

    return result;
}

function itemSchemaToArrayFields(
    itemSchema?: ContentField[],
): Record<string, Record<string, unknown>> {
    const fields: Record<string, Record<string, unknown>> = {};
    itemSchema?.forEach((f) => {
        if (f.type === 'richtext') {
            fields[f.key] = {
                type: 'richtext',
                label: f.label,
                initialHeight: 120,
            };
        } else if (f.type === 'textarea') {
            fields[f.key] = { type: 'textarea', label: f.label };
        } else if (f.type === 'boolean') {
            fields[f.key] = {
                type: 'radio',
                label: f.label,
                options: [
                    { label: 'No', value: false },
                    { label: 'Sí', value: true },
                ],
            };
        } else if (f.type === 'list') {
            fields[f.key] = {
                type: 'array',
                label: f.label,
                arrayFields: itemSchemaToArrayFields(f.itemSchema),
                defaultItemProps: defaultItemProps(f.itemSchema),
                getItemSummary,
            };
        } else if (f.type === 'slot') {
            // Patrón Puck v0.22+ para multi-column layouts: cada
            // item del array lleva un sub-field `type: 'slot'`. El
            // operator agrega/quita items con + y × de Puck y mete
            // bloques dentro del slot.
            fields[f.key] = {
                type: 'slot',
                label: f.label,
                // Altura mínima para que la dropzone interna sea
                // visible y clickeable cuando la columna está vacía.
                minEmptyHeight: 80,
            };
        } else if (f.type === 'icon') {
            fields[f.key] = {
                type: 'custom',
                label: f.label,
                render: iconField.render,
            };
        } else if (f.type === 'image') {
            fields[f.key] = {
                type: 'custom',
                label: f.label,
                render: imageField.render,
            };
        } else if (f.type === 'radio') {
            fields[f.key] = {
                type: 'radio',
                label: f.label,
                options: f.options ?? [],
            };
        } else {
            fields[f.key] = { type: 'text', label: f.label };
        }
    });

    return fields;
}

function defaultItemProps(
    itemSchema?: ContentField[],
): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    itemSchema?.forEach((f) => {
        if (f.type === 'boolean') {
            obj[f.key] = false;
        } else if (f.type === 'list') {
            obj[f.key] = [];
        } else if (f.type === 'slot') {
            // Los slots almacenan un array de ComponentData cuando
            // están vacíos. Inicializamos como `[]` para que Puck
            // muestre la dropzone vacía.
            obj[f.key] = [];
        } else {
            obj[f.key] = '';
        }
    });

    return obj;
}

function getItemSummary(item: unknown, index: number): string {
    const record = (item ?? {}) as Record<string, unknown>;
    const candidate =
        (record.question as string) ||
        (record.title as string) ||
        (record.name as string) ||
        (record.label as string);

    return candidate || `Item #${index + 1}`;
}

function schemaToFields(schema: ContentField[]): Fields {
    const fields: Fields = {};

    for (const f of schema) {
        if (f.type === 'richtext') {
            fields[f.key] = {
                type: 'richtext',
                label: f.label,
                initialHeight: 120,
            };
        } else if (f.type === 'textarea') {
            fields[f.key] = { type: 'textarea', label: f.label };
        } else if (f.type === 'image') {
            fields[f.key] = {
                type: 'custom',
                label: f.label,
                render: imageField.render,
                config: {
                    mediaKind: f.mediaKind ?? 'image',
                    label: f.label,
                },
            };
        } else if (f.type === 'icon') {
            fields[f.key] = {
                type: 'custom',
                label: f.label,
                render: iconField.render,
            };
        } else if (f.type === 'boolean') {
            fields[f.key] = {
                type: 'radio',
                label: f.label,
                options: [
                    { label: 'No', value: false },
                    { label: 'Sí', value: true },
                ],
            };
        } else if (f.type === 'radio') {
            fields[f.key] = {
                type: 'radio',
                label: f.label,
                options: f.options ?? [],
            };
        } else if (f.type === 'list') {
            fields[f.key] = {
                type: 'array',
                label: f.label,
                arrayFields: itemSchemaToArrayFields(f.itemSchema),
                defaultItemProps: defaultItemProps(f.itemSchema),
                // El schema puede sobrescribir getItemSummary con uno
                // específico del bloque (ej: el contenedor muestra
                // "N bloques" en el sidebar).
                getItemSummary: f.getItemSummary ?? getItemSummary,
            };
        } else {
            fields[f.key] = { type: 'text', label: f.label };
        }
    }

    return fields;
}

// Build the Puck Config.
//
// Two groups, in this exact order:
//   1. "Bloques prediseñados"  → every entry from SECTION_REGISTRY
//   2. "Bloques básicos"        → every entry from BASIC_BLOCKS_REGISTRY
//
// IDs are unique and disjoint between the two registries — the audit script
// (scripts/audit-puck-blocks.mjs) verifies this on every build.
export function buildPuckConfig({ theme }: Props): Config {
    const components: Config['components'] = {};

    // --- Group 1: pre-designed sections ---------------------------------
    const preDesignedIds = Object.keys(SECTION_REGISTRY);

    for (const id of preDesignedIds) {
        const def = SECTION_REGISTRY[id];
        components[id] = {
            label: def.label,
            fields: schemaToFields(def.schema),
            defaultProps: { ...def.defaultContent },
            render: (renderProps) => {
                const Component = def.component;
                const {
                    hidden,
                    id: _id,
                    ...rest
                } = renderProps as {
                    hidden?: boolean;
                    id?: string;
                } & Record<string, unknown>;

                if (hidden) {
                    return (
                        <div
                            style={{
                                padding: '40px',
                                border: '2px dashed #ccc',
                                textAlign: 'center',
                                color: '#666',
                            }}
                        >
                            Bloque oculto
                        </div>
                    );
                }

                const normalized = normalizeImageContent(rest);

                return (
                    <Component
                        content={normalized as SectionContent}
                        theme={theme}
                    />
                );
            },
        };
    }

    // --- Group 2: basic blocks ------------------------------------------
    const basicIds = Object.keys(BASIC_BLOCKS_REGISTRY);

    for (const id of basicIds) {
        const def = BASIC_BLOCKS_REGISTRY[id];
        components[id] = {
            label: def.label,
            // Para todos los bloques (incluido el contenedor) declaramos
            // los fields via el schema declarativo. El contenedor tiene
            // un campo `columns` con sub-slots — el mapeo slot → dropzone
            // lo hace `schemaToFields` (que delega en
            // `itemSchemaToArrayFields` para los items de array).
            fields: schemaToFields(def.schema),
            defaultProps: { ...def.defaultContent },
            render: (renderProps) => {
                const Component = def.component;
                const { hidden, id: puckId, ...rest } = renderProps as {
                    hidden?: boolean;
                    id?: string;
                } & Record<string, unknown>;

                if (hidden) {
                    return (
                        <div
                            style={{
                                padding: '40px',
                                border: '2px dashed #ccc',
                                textAlign: 'center',
                                color: '#666',
                            }}
                        >
                            Bloque oculto
                        </div>
                    );
                }

                const normalized = normalizeImageContent(rest);

                return (
                    <Component
                        id={puckId}
                        content={normalized as BlockContent}
                        theme={theme}
                    />
                );
            },
        };
    }

    // Make sure no key from the section registry leaked into the basic list
    // and vice versa — defensive check, but cheap.
    for (const id of preDesignedIds) {
        if (basicIds.includes(id)) {
            console.warn(
                `[puck-config] id "${id}" appears in both SECTION_REGISTRY and BASIC_BLOCKS_REGISTRY`,
            );
        }
    }

    return {
        components,
        categories: {
            'bloques-predisenados': {
                title: 'Bloques prediseñados',
                components: preDesignedIds,
                defaultExpanded: true,
            },
            'bloques-basicos': {
                title: 'Bloques básicos',
                components: basicIds,
                defaultExpanded: true,
            },
        },
    };
}
