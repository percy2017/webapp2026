import type { Config, Fields } from '@puckeditor/core';
import {
    SECTION_REGISTRY,
    type ContentField,
    type SectionContent,
    type SectionTheme,
} from '@site/lib/template-registry';
import {
    BASIC_BLOCKS_REGISTRY,
    type BlockContent,
    type BlockProps,
} from '@site/lib/basic-blocks-registry';
import { imageField } from '@site/lib/puck-fields/image-field';
import { iconField } from '@site/lib/puck-fields/icon-field';

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
        result.image_media_id =
            typeof obj.id === 'number' ? obj.id : null;
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

function defaultItemProps(itemSchema?: ContentField[]): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    itemSchema?.forEach((f) => {
        if (f.type === 'boolean') obj[f.key] = false;
        else if (f.type === 'list') obj[f.key] = [];
        else obj[f.key] = '';
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
                getItemSummary,
            };
        } else {
            fields[f.key] = { type: 'text', label: f.label };
        }
    }
    return fields;
}

export function buildPuckConfig({ theme }: Props): Config {
    const components: Config['components'] = {};
    const sectionIds: string[] = [];
    const basicBlockIds: string[] = [];

    for (const [id, def] of Object.entries(SECTION_REGISTRY)) {
        sectionIds.push(id);

        components[id] = {
            label: def.label,
            fields: schemaToFields(def.schema),
            defaultProps: { ...def.defaultContent },
            render: (renderProps) => {
                const Component = def.component;
                const { hidden, id: _id, ...rest } = renderProps as {
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

    for (const [id, def] of Object.entries(BASIC_BLOCKS_REGISTRY)) {
        basicBlockIds.push(id);

        components[id] = {
            label: def.label,
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

    return {
        components,
        categories: {
            'pre-designed': {
                title: 'Secciones prediseñadas',
                components: sectionIds,
                defaultExpanded: false,
            },
            basics: {
                title: 'Bloques básicos',
                components: basicBlockIds,
                defaultExpanded: false,
            },
        },
    };
}