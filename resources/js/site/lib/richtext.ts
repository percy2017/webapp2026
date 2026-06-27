type TiptapNode = {
    type?: string;
    content?: TiptapNode[];
    text?: string;
    marks?: TiptapMark[];
    attrs?: Record<string, unknown>;
};

type TiptapMark = {
    type: string;
    attrs?: Record<string, unknown>;
};

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function isTiptapDoc(value: unknown): value is TiptapNode {
    return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        (value as TiptapNode).type === 'doc'
    );
}

function renderText(node: TiptapNode): string {
    let html = escapeHtml(node.text ?? '');
    const marks = node.marks ?? [];
    for (const mark of marks) {
        switch (mark.type) {
            case 'bold':
                html = `<strong>${html}</strong>`;
                break;
            case 'italic':
                html = `<em>${html}</em>`;
                break;
            case 'underline':
                html = `<u>${html}</u>`;
                break;
            case 'strike':
                html = `<s>${html}</s>`;
                break;
            case 'code':
                html = `<code>${html}</code>`;
                break;
            case 'link': {
                const href = mark.attrs?.href;
                if (typeof href === 'string' && href.length > 0) {
                    const safeHref = escapeHtml(href);
                    const target =
                        mark.attrs?.target === '_blank'
                            ? ' target="_blank" rel="noopener noreferrer"'
                            : '';
                    html = `<a href="${safeHref}"${target}>${html}</a>`;
                }
                break;
            }
            default:
                break;
        }
    }
    return html;
}

function renderNode(node: TiptapNode): string {
    if (node.type === 'text') {
        return renderText(node);
    }

    const inner = Array.isArray(node.content)
        ? node.content.map(renderNode).join('')
        : '';

    switch (node.type) {
        case 'doc':
            return inner;
        case 'paragraph':
            return `<p>${inner}</p>`;
        case 'heading': {
            const level =
                typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
            const safe = Math.min(Math.max(level, 1), 6);
            return `<h${safe}>${inner}</h${safe}>`;
        }
        case 'bulletList':
            return `<ul>${inner}</ul>`;
        case 'orderedList':
            return `<ol>${inner}</ol>`;
        case 'listItem':
            return `<li>${inner}</li>`;
        case 'blockquote':
            return `<blockquote>${inner}</blockquote>`;
        case 'codeBlock':
            return `<pre><code>${inner}</code></pre>`;
        case 'horizontalRule':
            return '<hr />';
        case 'hardBreak':
            return '<br />';
        default:
            return inner;
    }
}

export function richTextToHtml(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    if (isTiptapDoc(value)) {
        return renderNode(value);
    }
    return '';
}

export function richTextToPlainText(value: unknown): string {
    if (typeof value === 'string') {
        return value.replace(/<[^>]*>/g, '').trim();
    }
    if (isTiptapDoc(value)) {
        const collect = (node: TiptapNode): string => {
            if (node.type === 'text') return node.text ?? '';
            if (!Array.isArray(node.content)) return '';
            return node.content.map(collect).join(' ');
        };
        return collect(value).trim();
    }
    return '';
}