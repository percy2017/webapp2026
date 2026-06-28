import { QrCode, Download, Copy, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
    /**
     * Override the URL the QR encodes. Defaults to the current page URL
     * resolved at click-time (so it always matches the address bar).
     */
    url?: string;
    /**
     * Render the trigger as a floating action button (default) or inline.
     */
    variant?: 'floating' | 'inline';
    label?: string;
};

function buildQrSrc(url: string, size: number): string {
    return `/qr.svg?size=${size}&u=${encodeURIComponent(url)}`;
}

export function QrShareButton({
    url,
    variant = 'floating',
    label = 'Compartir / QR',
}: Props) {
    const [open, setOpen] = useState(false);
    const [resolvedUrl, setResolvedUrl] = useState<string>(url ?? '');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (url) {
            setResolvedUrl(url);

            return;
        }
        if (typeof window !== 'undefined') {
            setResolvedUrl(window.location.href);
        }
    }, [url]);

    const downloadHref = useMemo(
        () => `/qr/download?u=${encodeURIComponent(resolvedUrl)}`,
        [resolvedUrl],
    );

    const previewSrc = buildQrSrc(resolvedUrl, 320);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(resolvedUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard unavailable — silently ignore */
        }
    }

    const trigger =
        variant === 'floating' ? (
            <Button
                type="button"
                size="icon"
                className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg"
                aria-label={label}
            >
                <QrCode className="h-5 w-5" />
            </Button>
        ) : (
            <Button type="button" variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" />
                {label}
            </Button>
        );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Compartir página</DialogTitle>
                    <DialogDescription>
                        Escaneá el QR o copiá el link para compartir esta
                        página.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4">
                    <div className="rounded-2xl border border-border bg-background p-4">
                        <img
                            src={previewSrc}
                            alt={`QR de ${resolvedUrl}`}
                            width={256}
                            height={256}
                            className="h-64 w-64"
                            loading="lazy"
                        />
                    </div>

                    <div className="flex w-full items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
                        <span className="flex-1 truncate font-mono text-muted-foreground">
                            {resolvedUrl}
                        </span>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={copyLink}
                            className="h-7 px-2"
                            aria-label="Copiar link"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    <div className="flex w-full gap-2">
                        <Button asChild className="flex-1">
                            <a
                                href={downloadHref}
                                download="tarjeta-qr.png"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Descargar PNG
                            </a>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={copyLink}
                        >
                            {copied ? '¡Copiado!' : 'Copiar link'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default QrShareButton;
