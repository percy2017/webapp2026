import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Loader2, Mail, Save, XCircle } from 'lucide-react';
import { useState } from 'react';
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
import { MediaPicker } from '@/components/media-picker';
import { admin } from '@/routes';
import {
    index as usersIndex,
    update as usersUpdate,
    sendVerification as sendVerificationRoute,
    toggleVerified as toggleVerifiedRoute,
} from '@/routes/users';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem } from '@/types';

type Role = { id: number; name: string };

type EditableUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    email_verified_at: string | null;
    roles: { id: number; name: string }[];
};

type Props = {
    user: EditableUser;
    roles: Role[];
};

export default function UserEdit({ user, roles }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const getInitials = useInitials();

    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        password: '',
        roles: user.roles.map((r) => r.name),
        media_id: null as number | null,
        remove_avatar: false,
    });
    const [preview, setPreview] = useState<string | null>(user.avatar_url);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [markingVerified, setMarkingVerified] = useState(false);

    const isVerified = user.email_verified_at !== null;

    function sendVerificationEmail() {
        setVerifying(true);
        router.post(
            sendVerificationRoute(user.id).url,
            {},
            { onFinish: () => setVerifying(false) },
        );
    }

    function toggleVerified() {
        setMarkingVerified(true);
        router.post(
            toggleVerifiedRoute(user.id).url,
            {},
            { onFinish: () => setMarkingVerified(false) },
        );
    }

    function handleMediaChange(id: number | null, url?: string) {
        setForm({
            ...form,
            media_id: id,
            remove_avatar: id === null && !!user.avatar_url,
        });
        if (id === null) {
            setPreview(user.avatar_url);
        } else if (url) {
            setPreview(url);
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        const payload: Record<string, unknown> = {
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            roles: form.roles,
        };
        if (form.password) payload.password = form.password;
        if (form.media_id !== null) payload.media_id = form.media_id;
        if (form.remove_avatar) payload.remove_avatar = true;

        router.patch(usersUpdate(user.id).url, payload, {
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
            <Head title={`Editar ${user.name}`} />

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
                                        fallbackInitials={getInitials(
                                            user.name,
                                        )}
                                        onChange={handleMediaChange}
                                        hideUpload
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Roles</CardTitle>
                                    <CardDescription>
                                        Tildá los roles que querés asignarle.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((role) => {
                                            const active =
                                                form.roles.includes(role.name);

                                            return (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setForm({
                                                            ...form,
                                                            roles: active
                                                                ? form.roles.filter(
                                                                      (
                                                                          r,
                                                                      ) =>
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

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Nueva contraseña
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
                                            placeholder="Dejar vacío para mantener la actual"
                                            autoComplete="new-password"
                                        />
                                        {errors.password && (
                                            <p className="text-xs text-destructive">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3 border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Verificación de email
                                            </Label>
                                        </div>

                                        {isVerified ? (
                                            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="font-medium">
                                                    Verificado
                                                </span>
                                                <span className="text-xs opacity-80">
                                                    ·{' '}
                                                    {new Date(
                                                        user.email_verified_at!,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                                <XCircle className="h-4 w-4" />
                                                <span className="font-medium">
                                                    No verificado
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {!isVerified && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={verifying}
                                                    onClick={sendVerificationEmail}
                                                >
                                                    {verifying && (
                                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                    )}
                                                    <Mail className="mr-2 h-3 w-3" />
                                                    Enviar email de verificación
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={markingVerified}
                                                onClick={toggleVerified}
                                            >
                                                {markingVerified && (
                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                )}
                                                {isVerified
                                                    ? 'Marcar como no verificado'
                                                    : 'Marcar como verificado'}
                                            </Button>
                                        </div>
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
                                    Guardar cambios
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

UserEdit.layout = {
    breadcrumbs: [
        { title: 'Admin', href: admin() },
        { title: 'Usuarios', href: usersIndex().url },
        { title: 'Editar', href: `/admin/users/${0}/edit` },
    ],
};