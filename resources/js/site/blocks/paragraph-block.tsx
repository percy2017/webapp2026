import type { BlockProps } from '@site/lib/basic-blocks-registry';
import { richTextToHtml, richTextToPlainText } from '@site/lib/richtext';

const ALIGN_CLASS: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

export function ParagraphBlock({ content }: BlockProps) {
    const { content: raw, align = 'left' } = content as {
        content?: unknown;
        align?: string;
    };

    const html = richTextToHtml(raw);
    const hasContent = richTextToPlainText(raw).length > 0;
    const cls = ALIGN_CLASS[align] ?? '';

    const finalHtml = hasContent
        ? html
        : '<p class="italic text-muted-foreground">Escribí el contenido en el panel derecho.</p>';

    return (
        <div
            className={`prose prose-sm dark:prose-invert max-w-none text-muted-foreground prose-headings:text-foreground prose-a:text-primary ${cls}`}
            dangerouslySetInnerHTML={{ __html: finalHtml }}
        />
    );
}