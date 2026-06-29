import { Head, Link, router } from '@inertiajs/react';
import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    index as indexRoute,
    store as storeRoute,
} from '@/routes/site-templates';
import type { BreadcrumbItem } from '@/types';
import { listPresetTemplates } from '@site/lib/preset-templates';
import type { PresetTemplate } from '@site/lib/preset-templates';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Páginas', href: '/admin/site-templates' },
    { title: 'Nueva', href: '/admin/site-templates/create' },
];

export default function SiteTemplateCreate() {
    const presets = listPresetTemplates();
    const [selected, setSelected] = useState<PresetTemplate | null>(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function pickPreset(p: PresetTemplate) {
        // Toggle: clicking the same preset again clears the selection so
        // the user can switch to "no preset" without restarting the form.
        if (selected?.id === p.id) {
            setSelected(null);
            setErrors({});

            return;
        }

        setSelected(p);
        setName(p.defaultName);
        setSlug(p.defaultSlug);
        setDescription(p.defaultDescription);
        setErrors({});
    }

    function slugify(value: string): string {
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        // Preset is optional — when none is picked the template is created
        // empty (no sections, no blocks, no menu items) and the user fills
        // it in from the editor. Brand identity (logo, favicon, PWA) is
        // owned by /admin/site-settings, not by the template.
        const payload: Record<string, unknown> = {
            name,
            slug,
            description,
        };

        if (selected) {
            payload.icon = selected.icon;
            payload.sections = selected.sections;
            payload.blocks = selected.blocks;
            payload.menu_items = selected.menu_items;
            // Carry the preset's brand so /admin/site-settings, the
            // PWA manifest, and the favicon reflect the preset's
            // identity from minute one. The operator can override
            // any of these on /admin/site-settings afterwards.
            if (selected.brand) {
                payload.brand = selected.brand;
            }
        }

        router.post(storeRoute().url, payload, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Record<string, string>),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Nueva página" />

            <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="max-w-5xl space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Datos básicos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);

                                            if (
                                                !slug ||
                                                slug === slugify(name)
                                            ) {
                                                setSlug(
                                                    slugify(e.target.value),
                                                );
                                            }
                                        }}
                                        placeholder="Restaurant, Gimnasio, Consultorio…"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (URL)</Label>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) =>
                                            setSlug(slugify(e.target.value))
                                        }
                                        placeholder="restaurant"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Solo letras minúsculas, números y
                                        guiones.
                                    </p>
                                    {errors.slug && (
                                        <p className="text-xs text-destructive">
                                            {errors.slug}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Descripción
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Ideal para restaurantes, bares y cafeterías."
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-semibold">
                                    Plantilla inicial
                                </Label>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                    Opcional
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Elegí una plantilla para pre-rellenar las
                                secciones y bloques. Si no elegís ninguna, la
                                página se crea vacía y la armás desde el editor.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {presets.map((p) => {
                                    const isActive = selected?.id === p.id;

                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => pickPreset(p)}
                                            className={`group relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                                                isActive
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                                                    : 'border-border bg-card hover:border-primary/50'
                                            }`}
                                        >
                                            <div className="flex w-full items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${p.accent}`}
                                                >
                                                    <Sparkles className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold">
                                                        {p.name}
                                                    </p>
                                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                                        {p.description}
                                                    </p>
                                                </div>
                                                {isActive && (
                                                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground uppercase">
                                                        Elegida
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                                                <span>
                                                    {p.sections.length}{' '}
                                                    secciones
                                                    {p.blocks.length > 0 &&
                                                        ` · ${p.blocks.length} bloques`}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                                Revisá los campos marcados.
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button asChild variant="outline">
                                <Link href={indexRoute().url}>Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {selected
                                    ? 'Crear con plantilla'
                                    : 'Crear página vacía'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

SiteTemplateCreate.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
