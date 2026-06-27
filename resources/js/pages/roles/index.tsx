import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Save, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { destroy, index, store, update } from '@/routes/roles';

type RoleItem = {
    id: number;
    name: string;
    users_count: number;
    permissions_list: string;
    permissions: { id: number; name: string }[];
};

type Permission = { id: number; name: string };

type Props = {
    roles: RoleItem[];
    permissions: Permission[];
};

type Editing = {
    id?: number;
    name: string;
    permissions: string[];
};

export default function RolesIndex({ roles, permissions }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Editing | null>(null);
    const [deleting, setDeleting] = useState<RoleItem | null>(null);
    const [saving, setSaving] = useState(false);

    function openCreate() {
        setEditing({ name: '', permissions: [] });
        setOpen(true);
    }

    function openEdit(role: RoleItem) {
        setEditing({
            id: role.id,
            name: role.name,
            permissions: role.permissions.map((p) => p.name),
        });
        setOpen(true);
    }

    function togglePermission(name: string) {
        if (!editing) return;
        const set = new Set(editing.permissions);
        if (set.has(name)) {
            set.delete(name);
        } else {
            set.add(name);
        }
        setEditing({ ...editing, permissions: Array.from(set) });
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);

        const url = editing.id ? update(editing.id) : store();
        const form = new FormData();
        form.append('name', editing.name);
        editing.permissions.forEach((p) => form.append('permissions[]', p));

        router.post(url, form, {
            forceFormData: true,
            onFinish: () => {
                setSaving(false);
                setOpen(false);
                setEditing(null);
            },
        });
    }

    function handleDelete(role: RoleItem) {
        setDeleting(role);
    }

    function confirmDelete() {
        if (!deleting) return;
        router.delete(destroy(deleting.id), {
            onFinish: () => setDeleting(null),
        });
    }

    return (
        <>
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Roles
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Define los roles y asigna permisos a cada uno.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo rol
                    </Button>
                </div>

                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Rol
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Permisos
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Usuarios
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                No hay roles definidos.
                                            </td>
                                        </tr>
                                    ) : (
                                        roles.map((role) => (
                                            <tr
                                                key={role.id}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {role.permissions.length >
                                                    0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {role.permissions.map(
                                                                (p) => (
                                                                    <Badge
                                                                        key={
                                                                            p.id
                                                                        }
                                                                        variant="outline"
                                                                    >
                                                                        {p.name}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Sin permisos
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {role.users_count}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEdit(role)
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    role,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={open}
                onOpenChange={(o) => {
                    setOpen(o);
                    if (!o) setEditing(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing?.id ? 'Editar rol' : 'Nuevo rol'}
                        </DialogTitle>
                        <DialogDescription>
                            Define el nombre y los permisos del rol.
                        </DialogDescription>
                    </DialogHeader>
                    {editing && (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={editing.name}
                                        onChange={(e) =>
                                            setEditing({
                                                ...editing,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Permisos</Label>
                                    <div className="space-y-2 rounded-md border p-3">
                                        {permissions.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">
                                                No hay permisos definidos.
                                            </p>
                                        ) : (
                                            permissions.map((perm) => (
                                                <label
                                                    key={perm.id}
                                                    className="flex cursor-pointer items-center gap-2"
                                                >
                                                    <Checkbox
                                                        checked={editing.permissions.includes(
                                                            perm.name,
                                                        )}
                                                        onCheckedChange={() =>
                                                            togglePermission(
                                                                perm.name,
                                                            )
                                                        }
                                                    />
                                                    <span className="text-sm">
                                                        {perm.name}
                                                    </span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false);
                                        setEditing(null);
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving && (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    )}
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Eliminar rol"
                description={`¿Eliminar el rol "${deleting?.name}"? Los usuarios con este rol lo perderán.`}
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin' },
        { title: 'Usuarios', href: '/admin/users' },
        { title: 'Roles', href: index() },
    ],
};
