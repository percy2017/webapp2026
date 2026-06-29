import { BASIC_BLOCKS_REGISTRY } from '@site/lib/basic-blocks-registry';
import { SECTION_REGISTRY } from '@site/lib/template-registry';
import type { SectionContent, SectionTheme } from '@site/lib/template-registry';

export type SiteSectionSerialized = {
    id: string;
    visible: boolean;
    content: SectionContent;
};

export type SiteBlockSerialized = {
    id: string;
    type: string;
    visible: boolean;
    content: SectionContent;
    block_db_id?: number;
};

export type PuckData = {
    content: PuckBlock[];
    root: { props: Record<string, unknown> };
    zones?: Record<string, PuckBlock[]>;
};

export type PuckBlock = {
    type: string;
    props: Record<string, unknown>;
};

const TRANSIENT_KEYS = new Set(['id', 'image_url', 'image_url_thumb']);

function isSectionType(type: string): boolean {
    return type in SECTION_REGISTRY;
}

function normalizeMediaField(
    value: unknown,
): number | null | Record<string, unknown> {
    if (value && typeof value === 'object' && 'id' in value) {
        const obj = value as { id: unknown; url?: unknown };
        const result: Record<string, unknown> = {
            id: typeof obj.id === 'number' ? obj.id : null,
        };

        if (typeof obj.url === 'string') {
            result.url = obj.url;
        }

        return result;
    }

    if (typeof value === 'number') {
        return value;
    }

    if (value === null || value === undefined) {
        return null;
    }

    return null;
}

export function sectionsToPuckData(
    sections: SiteSectionSerialized[],
    blocks: SiteBlockSerialized[] = [],
): PuckData {
    const all = [
        ...sections.map((s) => ({
            kind: 'section' as const,
            id: s.id,
            visible: s.visible,
            content: s.content ?? {},
        })),
        ...blocks.map((b) => ({
            kind: 'block' as const,
            id: b.type,
            visible: b.visible,
            content: b.content ?? {},
            block_db_id: b.block_db_id,
        })),
    ];

    return {
        content: all.map((item, index) => {
            const props: Record<string, unknown> = {
                id: `${item.id}-${index}-${Math.random().toString(36).slice(2, 8)}`,
                hidden: !item.visible,
            };

            if ('block_db_id' in item && item.block_db_id) {
                props.block_db_id = item.block_db_id;
            }

            for (const [key, value] of Object.entries(item.content)) {
                if (TRANSIENT_KEYS.has(key)) {
                    continue;
                }

                if (key === 'image_media_id') {
                    const normalized = normalizeMediaField(value);

                    if (
                        typeof normalized === 'number' &&
                        normalized > 0 &&
                        typeof item.content.image_url === 'string'
                    ) {
                        props[key] = {
                            id: normalized,
                            url: item.content.image_url,
                        };
                    } else {
                        props[key] = normalized;
                    }
                } else {
                    props[key] = value;
                }
            }

            return {
                type: item.id,
                props,
            };
        }),
        root: { props: { id: 'root' } },
    };
}

export type PuckToSectionsResult = {
    sections: SiteSectionSerialized[];
    blocks: Array<Omit<SiteBlockSerialized, 'id'>>;
};

export function puckDataToSplit(data: PuckData): PuckToSectionsResult {
    const sections: SiteSectionSerialized[] = [];
    const blocks: Array<Omit<SiteBlockSerialized, 'id'>> = [];

    if (!data?.content) {
        return { sections, blocks };
    }

    for (const block of data.content) {
        if (!block.type) {
            continue;
        }

        const {
            hidden,
            id: _id,
            block_db_id,
            ...content
        } = block.props as {
            hidden?: boolean;
            id?: string;
            block_db_id?: number;
        } & Record<string, unknown>;

        const normalizedContent: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(content)) {
            if (key === 'image_media_id') {
                const mediaId = normalizeMediaField(value);
                normalizedContent[key] =
                    mediaId && typeof mediaId === 'object'
                        ? mediaId.id
                        : mediaId;
            } else {
                normalizedContent[key] = value;
            }
        }

        const entry = {
            visible: hidden !== true,
            content: normalizedContent as SectionContent,
        };

        if (isSectionType(block.type)) {
            sections.push({
                id: block.type,
                ...entry,
            });
        } else if (block.type in BASIC_BLOCKS_REGISTRY) {
            blocks.push({
                type: block.type,
                block_db_id:
                    typeof block_db_id === 'number' ? block_db_id : undefined,
                ...entry,
            });
        }
    }

    return { sections, blocks };
}

export function emptyPuckData(): PuckData {
    return { content: [], root: { props: {} } };
}

export type { SectionTheme };
