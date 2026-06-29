import { Head, Link, router, usePage } from '@inertiajs/react';
import { Image as ImageIcon, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { generate, index } from '@/routes/media';

const aspectRatios = [
    { value: '1:1', label: '1:1 (Cuadrado)' },
    { value: '16:9', label: '16:9 (Horizontal)' },
    { value: '4:3', label: '4:3' },
    { value: '3:2', label: '3:2' },
    { value: '2:3', label: '2:3' },
    { value: '3:4', label: '3:4' },
    { value: '9:16', label: '9:16 (Vertical)' },
    { value: '21:9', label: '21:9 (Cinema)' },
];

type FormData = {
    prompt: string;
    aspect_ratio: string;
    n: string;
    prompt_optimizer: boolean;
    seed: string;
    reference_image: File | null;
};

export default function MediaGenerate() {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState('text-to-image');
    const [form, setForm] = useState<FormData>({
        prompt: '',
        aspect_ratio: '1:1',
        n: '1',
        prompt_optimizer: false,
        seed: '',
        reference_image: null,
    });
    const [refPreviewUrl, setRefPreviewUrl] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [generating, setGenerating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        updateField('reference_image', file);

        if (file) {
            const url = URL.createObjectURL(file);
            setRefPreviewUrl(url);
        } else {
            setRefPreviewUrl(null);
        }
    }

    function clearFile() {
        updateField('reference_image', null);
        setRefPreviewUrl(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const aspectLabel =
        aspectRatios.find((ar) => ar.value === form.aspect_ratio)?.label ??
        form.aspect_ratio;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});
        setGenerating(true);
        setGeneratedImages([]);

        const payload: Record<string, unknown> = {
            prompt: form.prompt,
            aspect_ratio: form.aspect_ratio,
            n: form.n,
            prompt_optimizer: form.prompt_optimizer,
        };

        if (form.seed) {
            payload.seed = form.seed;
        }

        if (form.reference_image) {
            payload.reference_image = form.reference_image;
        }

        router.post(generate.store().url, payload, {
            forceFormData: true,
            onSuccess: (page) => {
                setGenerating(false);
                const flash = page.props.flash as
                    | { success?: string }
                    | undefined;

                if (flash?.success) {
                    setGeneratedImages(['success']);
                }
            },
            onError: (errs) => {
                const flat: Record<string, string> = {};
                Object.entries(errs).forEach(([k, v]) => {
                    flat[k] = Array.isArray(v) ? v[0] : String(v);
                });
                setErrors(flat);
                setGenerating(false);
            },
            onFinish: () => setGenerating(false),
        });
    }

    return (
        <>
            <Head title="Generar imagen" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Generar imagen con IA</CardTitle>
                                    <CardDescription>
                                        MiniMax image-01 — texto a imagen o con
                                        imagen de referencia.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Tabs
                                        value={mode}
                                        onValueChange={(v) => setMode(v)}
                                    >
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="text-to-image">
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Texto a imagen
                                            </TabsTrigger>
                                            <TabsTrigger value="image-to-image">
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                Imagen a imagen
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent
                                            value="text-to-image"
                                            className="space-y-4 pt-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="prompt">
                                                    Descripción
                                                </Label>
                                                <Textarea
                                                    id="prompt"
                                                    placeholder="Ej: un atardecer en la playa con palmeras, fotografía realista, 4K"
                                                    value={form.prompt}
                                                    onChange={(e) =>
                                                        updateField(
                                                            'prompt',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={4}
                                                    required
                                                    autoFocus
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Máximo 1500 caracteres.
                                                </p>
                                                {errors.prompt && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.prompt}
                                                    </p>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent
                                            value="image-to-image"
                                            className="space-y-4 pt-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="reference_image">
                                                    Imagen de referencia
                                                </Label>
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        id="reference_image"
                                                        type="file"
                                                        accept="image/jpeg,image/png"
                                                        ref={fileInputRef}
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                        className={
                                                            refPreviewUrl
                                                                ? 'hidden'
                                                                : ''
                                                        }
                                                    />
                                                    {refPreviewUrl && (
                                                        <div className="relative inline-flex">
                                                            <img
                                                                src={
                                                                    refPreviewUrl
                                                                }
                                                                alt="Preview"
                                                                className="h-24 w-24 rounded-lg border object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    clearFile
                                                                }
                                                                className="absolute -top-2 -right-2 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow"
                                                                aria-label="Quitar imagen"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {!refPreviewUrl && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                fileInputRef.current?.click()
                                                            }
                                                        >
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Seleccionar imagen
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    JPG o PNG, máximo 10 MB.
                                                    Foto frontal del rostro para
                                                    mejores resultados.
                                                </p>
                                                {errors.reference_image && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.reference_image}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="prompt-img">
                                                    Descripción (opcional)
                                                </Label>
                                                <Textarea
                                                    id="prompt-img"
                                                    placeholder="Ej: la misma persona en una playa tropical al atardecer"
                                                    value={form.prompt}
                                                    onChange={(e) =>
                                                        updateField(
                                                            'prompt',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={4}
                                                />
                                                {errors.prompt && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.prompt}
                                                    </p>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="aspect_ratio">
                                                Relación de aspecto
                                            </Label>
                                            <Select
                                                value={form.aspect_ratio}
                                                onValueChange={(v) =>
                                                    updateField(
                                                        'aspect_ratio',
                                                        v,
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="aspect_ratio">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {aspectRatios.map((ar) => (
                                                        <SelectItem
                                                            key={ar.value}
                                                            value={ar.value}
                                                        >
                                                            {ar.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.aspect_ratio && (
                                                <p className="text-xs text-destructive">
                                                    {errors.aspect_ratio}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="n">
                                                Cantidad de imágenes
                                            </Label>
                                            <Select
                                                value={form.n}
                                                onValueChange={(v) =>
                                                    updateField('n', v)
                                                }
                                            >
                                                <SelectTrigger id="n">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from(
                                                        { length: 9 },
                                                        (_, i) => i + 1,
                                                    ).map((n) => (
                                                        <SelectItem
                                                            key={n}
                                                            value={String(n)}
                                                        >
                                                            {n}{' '}
                                                            {n === 1
                                                                ? 'imagen'
                                                                : 'imágenes'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.n && (
                                                <p className="text-xs text-destructive">
                                                    {errors.n}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="prompt_optimizer">
                                                Optimizar descripción
                                            </Label>
                                            <Select
                                                value={
                                                    form.prompt_optimizer
                                                        ? 'yes'
                                                        : 'no'
                                                }
                                                onValueChange={(v) =>
                                                    updateField(
                                                        'prompt_optimizer',
                                                        v === 'yes',
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="prompt_optimizer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="no">
                                                        No
                                                    </SelectItem>
                                                    <SelectItem value="yes">
                                                        Sí
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Mejora automática del prompt.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="seed">
                                                Semilla (opcional)
                                            </Label>
                                            <Input
                                                id="seed"
                                                type="number"
                                                placeholder="Ej: 12345"
                                                value={form.seed}
                                                onChange={(e) =>
                                                    updateField(
                                                        'seed',
                                                        e.target.value,
                                                    )
                                                }
                                                min={0}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Misma semilla = misma imagen.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button asChild variant="outline">
                                            <Link href={index().url}>
                                                Cancelar
                                            </Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={generating}
                                        >
                                            {generating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Generando...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Generar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle>Vista previa</CardTitle>
                                    <CardDescription>
                                        {mode === 'text-to-image'
                                            ? 'Resultado de la generación'
                                            : 'Imagen de referencia y resultado'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {generating ? (
                                        <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Generando imagen...
                                                </p>
                                            </div>
                                        </div>
                                    ) : generatedImages.length > 0 ? (
                                        <div className="rounded-lg border bg-green-50 p-6 text-center dark:bg-green-950">
                                            <ImageIcon className="mx-auto mb-3 h-12 w-12 text-green-600 dark:text-green-400" />
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                Imagen generada correctamente
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Redirigiendo a la galería...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
                                            <div className="flex flex-col items-center gap-3 px-6 text-center">
                                                <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Sin generar
                                                    </p>
                                                    <p className="max-w-xs text-xs text-muted-foreground/70">
                                                        Completa el formulario y
                                                        haz clic en "Generar"
                                                        para ver el resultado
                                                        aquí.
                                                    </p>
                                                </div>
                                                {refPreviewUrl && (
                                                    <div className="mt-2 w-full">
                                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                            Imagen de referencia
                                                        </p>
                                                        <img
                                                            src={refPreviewUrl}
                                                            alt="Reference"
                                                            className="mx-auto max-h-48 rounded-lg border object-contain"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-2 rounded-lg border bg-muted/50 p-3">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Resumen
                                        </p>
                                        <div className="space-y-1 text-xs text-muted-foreground">
                                            <p>
                                                <span className="font-medium text-foreground">
                                                    Modo:
                                                </span>{' '}
                                                {mode === 'text-to-image'
                                                    ? 'Texto a imagen'
                                                    : 'Imagen a imagen'}
                                            </p>
                                            <p>
                                                <span className="font-medium text-foreground">
                                                    Aspecto:
                                                </span>{' '}
                                                {aspectLabel}
                                            </p>
                                            <p>
                                                <span className="font-medium text-foreground">
                                                    Cantidad:
                                                </span>{' '}
                                                {form.n}{' '}
                                                {form.n === '1'
                                                    ? 'imagen'
                                                    : 'imágenes'}
                                            </p>
                                            {form.prompt_optimizer && (
                                                <p>
                                                    <span className="font-medium text-foreground">
                                                        Optimizador:
                                                    </span>{' '}
                                                    Activado
                                                </p>
                                            )}
                                            {form.seed && (
                                                <p>
                                                    <span className="font-medium text-foreground">
                                                        Semilla:
                                                    </span>{' '}
                                                    {form.seed}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

MediaGenerate.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Medios',
            href: index(),
        },
        {
            title: 'Generar',
            href: generate(),
        },
    ],
};
