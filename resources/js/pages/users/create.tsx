import { Head, Link, router, usePage } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { MediaPicker } from '@/components/media-picker';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { admin } from '@/routes';
import { index as usersIndex, store as usersStore } from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

type Role = { id: number; name: string };

type Props = {
    roles: Role[];
};

export default function UserCreate({ roles }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const getInitials = useInitials();

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        roles: [] as string[],
        media_id: null as number | null,
        email_verified: false,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    function handleMediaChange(id: number | null, url?: string) {
        setForm({ ...form, media_id: id });

        if (url) {
            setPreview(url);
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        router.post(usersStore().url, form, {
            onSuccess: () => setSaving(false),
            onError: (errs) => {
                const flat: Record<string, string> = {};
                Object.entries(errs).forEach(([k, v]) => {
                    flat[k] = Array.isArray(v) ? v[0] : String(v);
                });
                setErrors(flat);
                setSaving(false);
            },
        });
    }

    return (
        <>
            <Head title="Nuevo usuario" />

            <div className="mx-auto flex h-full max-w-5xl flex-col gap-6 p-6">
                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Avatar</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MediaPicker
                                        value={form.media_id}
                                        preview={preview}
                                        fallbackInitials={
                                            form.name
                                                ? getInitials(form.name)
                                                : '?'
                                        }
                                        onChange={handleMediaChange}
                                        hideUpload
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Roles</CardTitle>
                                    <CardDescription>
                                        Asignale uno o varios roles al usuario.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((role) => {
                                            const active = form.roles.includes(
                                                role.name,
                                            );

                                            return (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setForm({
                                                            ...form,
                                                            roles: active
                                                                ? form.roles.filter(
                                                                      (r) =>
                                                                          r !==
                                                                          role.name,
                                                                  )
                                                                : [
                                                                      ...form.roles,
                                                                      role.name,
                                                                  ],
                                                        });
                                                    }}
                                                    className={`rounded-full border px-3 py-1 text-sm transition ${
                                                        active
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'hover:bg-accent'
                                                    }`}
                                                >
                                                    {role.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.roles && (
                                        <p className="mt-2 text-xs text-destructive">
                                            {errors.roles}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Datos básicos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                            autoFocus
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.email}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        email: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-destructive">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                Teléfono
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        phone: e.target.value,
                                                    })
                                                }
                                            />
                                            {errors.phone && (
                                                <p className="text-xs text-destructive">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="email_verified"
                                            checked={form.email_verified}
                                            onCheckedChange={(checked) =>
                                                setForm({
                                                    ...form,
                                                    email_verified:
                                                        checked === true,
                                                })
                                            }
                                        />
                                        <Label
                                            htmlFor="email_verified"
                                            className="cursor-pointer"
                                        >
                                            Marcar email como verificado
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Contraseña
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    password: e.target.value,
                                                })
                                            }
                                            required
                                            autoComplete="new-password"
                                        />
                                        {errors.password && (
                                            <p className="text-xs text-destructive">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <Link href={usersIndex().url}>
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <Save className="mr-2 h-4 w-4" />
                                    Crear usuario
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

UserCreate.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin() },
        { title: 'Usuarios', href: usersIndex().url },
        { title: 'Nuevo', href: '/admin/users/create' },
    ],
};
