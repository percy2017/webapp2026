import { Head, router, usePage } from '@inertiajs/react';
import { Check, Loader2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { admin } from '@/routes';
import { update } from '@/routes/chat-live/config';
import type { BreadcrumbItem } from '@/types';

type Settings = {
    enabled: boolean;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
};

type Props = {
    settings: Settings;
};

const POSITIONS: Array<{
    value: Settings['position'];
    label: string;
    className: string;
}> = [
    {
        value: 'top-left',
        label: 'Superior izquierda',
        className: 'top-3 left-3',
    },
    {
        value: 'top-right',
        label: 'Superior derecha',
        className: 'top-3 right-3',
    },
    {
        value: 'bottom-left',
        label: 'Inferior izquierda',
        className: 'bottom-20 left-4',
    },
    {
        value: 'bottom-right',
        label: 'Inferior derecha',
        className: 'bottom-20 right-4',
    },
];

export default function ChatLiveConfiguration({ settings }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const [form, setForm] = useState<Settings>(settings);
    const [saving, setSaving] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        router.patch(
            update(),
            { enabled: form.enabled, position: form.position },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    }

    return (
        <>
            <Head title="Configuración chat-live" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {props.flash?.success && (
                    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        <Check className="h-4 w-4" />
                        {props.flash.success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-6 lg:grid-cols-3"
                >
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado del widget</CardTitle>
                                <CardDescription>
                                    Activar o desactivar el chat en las
                                    páginas públicas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={form.enabled}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                enabled: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 rounded border-input"
                                    />
                                    <span className="text-sm font-medium">
                                        Widget activo
                                    </span>
                                </label>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Posición</CardTitle>
                                <CardDescription>
                                    Esquina donde aparecerá el botón flotante.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {POSITIONS.map((pos) => (
                                        <button
                                            key={pos.value}
                                            type="button"
                                            onClick={() =>
                                                setForm({
                                                    ...form,
                                                    position: pos.value,
                                                })
                                            }
                                            className={`rounded-lg border p-4 text-left text-sm transition-colors ${
                                                form.position === pos.value
                                                    ? 'border-primary bg-primary/10'
                                                    : 'hover:bg-accent'
                                            }`}
                                        >
                                            <div className="bg-muted/40 relative h-20 rounded">
                                                <span
                                                    className={`bg-primary absolute h-6 w-6 rounded-full ${pos.className}`}
                                                />
                                            </div>
                                            <p className="mt-2 text-center font-medium">
                                                {pos.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Guardar cambios
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Vista previa
                                </CardTitle>
                                <CardDescription>
                                    Aproximación de cómo se verá el widget.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/30 relative h-80 overflow-hidden rounded-lg border">
                                    <div className="bg-background/60 absolute inset-0" />
                                    <div
                                        className={`absolute ${
                                            form.position === 'top-left'
                                                ? 'top-3 left-3'
                                                : form.position === 'top-right'
                                                  ? 'top-3 right-3'
                                                  : form.position ===
                                                      'bottom-left'
                                                    ? 'bottom-20 left-4'
                                                    : 'bottom-20 right-4'
                                        }`}
                                    >
                                        <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full shadow-lg">
                                            <MessageCircle className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </>
    );
}

ChatLiveConfiguration.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin() },
        { title: 'Chat-live', href: '/admin/chat-live/chats' },
        { title: 'Configuración', href: '/admin/chat-live/configuration' },
    ],
};