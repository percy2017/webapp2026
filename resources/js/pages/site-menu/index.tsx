import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    CornerDownRight,
    Loader2,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { IconPicker, getMenuIcon } from '@/components/icon-picker';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
    destroy as destroyRoute,
    down as downRoute,
    index as indexRoute,
    store as storeRoute,
    update as updateRoute,
    up as upRoute,
} from '@/routes/site-menu';
import type { BreadcrumbItem } from '@/types';

type MenuItem = {
    id: number;
    parent_id: number | null;
    label: string;
    href: string;
    icon: string | null;
    location: string;
    sort: number;
    is_active: boolean;
    children?: MenuItem[];
};

type ParentOption = { id: number; label: string };

type Props = {
    items: MenuItem[];
    parentOptions: ParentOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Menú', href: '/admin/site-menu' },
];

type FormState = {
    parent_id: string;
    label: string;
    href: string;
    icon: string | null;
    is_active: boolean;
};

const EMPTY_FORM: FormState = {
    parent_id: '',
    label: '',
    href: '',
    icon: null,
    is_active: true,
};

function flattenForReorder(items: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];

    for (const item of items) {
        result.push(item);

        if (item.children && item.children.length > 0) {
            for (const child of item.children) {
                result.push({ ...child, parent_id: item.id });
            }
        }
    }

    return result;
}

export default function SiteMenuIndex({ items, parentOptions }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const [editing, setEditing] = useState<MenuItem | null>(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<MenuItem | null>(null);
    const [processing, setProcessing] = useState(false);

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const flat = flattenForReorder(items);

    function openCreate(parent: MenuItem | null = null) {
        setForm({
            ...EMPTY_FORM,
            parent_id: parent ? String(parent.id) : '',
        });
        setErrors({});
        setCreating(true);
    }

    function openEdit(item: MenuItem) {
        setForm({
            parent_id: item.parent_id ? String(item.parent_id) : '',
            label: item.label,
            href: item.href,
            icon: item.icon ?? null,
            is_active: item.is_active,
        });
        setErrors({});
        setEditing(item);
    }

    function closeDialogs() {
        setCreating(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        setErrors({});
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const payload = {
            parent_id: form.parent_id || null,
            label: form.label,
            href: form.href,
            icon: form.icon,
            location: 'primary',
            is_active: form.is_active,
        };

        const onFinish = () => setProcessing(false);
        const onError = (errs: object) =>
            setErrors(errs as Record<string, string>);

        if (editing) {
            router.patch(updateRoute(editing.id).url, payload, {
                preserveScroll: true,
                onSuccess: closeDialogs,
                onError,
                onFinish,
            });
        } else {
            router.post(storeRoute().url, payload, {
                preserveScroll: true,
                onSuccess: closeDialogs,
                onError,
                onFinish,
            });
        }
    }

    function handleDelete() {
        if (!deleting) {
            return;
        }

        router.delete(destroyRoute(deleting.id).url, {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    }

    function handleMove(item: MenuItem, direction: 'up' | 'down') {
        const route = direction === 'up' ? upRoute : downRoute;
        router.post(route(item.id).url, undefined, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Menú del sitio" />

            <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Menú del sitio
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Items del menú principal público. Reordená con las
                            flechas, agrupá en sub-menús y agregá íconos.
                        </p>
                    </div>
                    <Button onClick={() => openCreate()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo item
                    </Button>
                </div>

                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border bg-card">
                    {items.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                No hay items en el menú. Creá el primero.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {items.map((item) => {
                                const Icon = getMenuIcon(item.icon);

                                return (
                                    <MenuItemRow
                                        key={item.id}
                                        item={item}
                                        Icon={Icon}
                                        onAddChild={() => openCreate(item)}
                                        onEdit={() => openEdit(item)}
                                        onDelete={() => setDeleting(item)}
                                        onMove={(dir) => handleMove(item, dir)}
                                    >
                                        {item.children?.map((child) => {
                                            const ChildIcon = getMenuIcon(
                                                child.icon,
                                            );

                                            return (
                                                <MenuItemRow
                                                    key={child.id}
                                                    item={child}
                                                    Icon={ChildIcon}
                                                    isChild
                                                    onEdit={() =>
                                                        openEdit(child)
                                                    }
                                                    onDelete={() =>
                                                        setDeleting(child)
                                                    }
                                                    onMove={(dir) =>
                                                        handleMove(child, dir)
                                                    }
                                                    siblings={
                                                        item.children ?? []
                                                    }
                                                />
                                            );
                                        })}
                                    </MenuItemRow>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Los items activos se muestran en el header público (
                    <Link href="/" target="_blank" className="underline">
                        ver sitio
                    </Link>
                    ).
                </p>
            </div>

            <Dialog
                open={creating || editing !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialogs();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editing
                                ? `Editar «${editing.label}»`
                                : 'Nuevo item del menú'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? 'Modificá el texto, enlace, ícono o padre.'
                                : 'Aparecerá en el header público si está activo.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        id="site-menu-form"
                        onSubmit={handleSubmit}
                        className="space-y-4 py-2"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="menu-parent">
                                Padre (opcional)
                            </Label>
                            <Select
                                value={form.parent_id || 'none'}
                                onValueChange={(v) =>
                                    setForm({
                                        ...form,
                                        parent_id: v === 'none' ? '' : v,
                                    })
                                }
                            >
                                <SelectTrigger id="menu-parent">
                                    <SelectValue placeholder="Sin padre (nivel superior)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        Sin padre (nivel superior)
                                    </SelectItem>
                                    {parentOptions.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                            disabled={editing?.id === p.id}
                                        >
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Si tiene padre, aparecerá como sub-menú.
                            </p>
                            {errors.parent_id && (
                                <p className="text-xs text-destructive">
                                    {errors.parent_id}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="menu-label">Etiqueta</Label>
                            <Input
                                id="menu-label"
                                value={form.label}
                                onChange={(e) =>
                                    setForm({ ...form, label: e.target.value })
                                }
                                placeholder="Inicio"
                                required
                            />
                            {errors.label && (
                                <p className="text-xs text-destructive">
                                    {errors.label}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="menu-href">Enlace</Label>
                            <Input
                                id="menu-href"
                                value={form.href}
                                onChange={(e) =>
                                    setForm({ ...form, href: e.target.value })
                                }
                                placeholder="#features"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                URL completa (https://...) o ancla (#section).
                            </p>
                            {errors.href && (
                                <p className="text-xs text-destructive">
                                    {errors.href}
                                </p>
                            )}
                        </div>

                        <IconPicker
                            value={form.icon}
                            onChange={(icon) => setForm({ ...form, icon })}
                        />
                        {errors.icon && (
                            <p className="text-xs text-destructive">
                                {errors.icon}
                            </p>
                        )}

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        is_active: e.target.checked,
                                    })
                                }
                                className="h-4 w-4 rounded border"
                            />
                            <span>Visible en el sitio público</span>
                        </label>
                    </form>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            form="site-menu-form"
                            disabled={processing}
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {editing ? 'Guardar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={Boolean(deleting)}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Eliminar item del menú"
                description={
                    deleting
                        ? `¿Eliminar «${deleting.label}»?${deleting.parent_id ? '' : ' Si tiene hijos, también se eliminarán.'}`
                        : ''
                }
                confirmLabel="Eliminar"
                onConfirm={handleDelete}
            />
        </>
    );
}

function MenuItemRow({
    item,
    Icon,
    isChild = false,
    siblings = [],
    onAddChild,
    onEdit,
    onDelete,
    onMove,
    children,
}: {
    item: MenuItem;
    Icon: typeof Home;
    isChild?: boolean;
    siblings?: MenuItem[];
    onAddChild?: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onMove: (dir: 'up' | 'down') => void;
    children?: React.ReactNode;
}) {
    const idx = siblings.findIndex((s) => s.id === item.id);
    const isFirst = idx === 0;
    const isLast = idx === siblings.length - 1;

    return (
        <li>
            <div
                className={`flex items-center gap-3 px-4 py-3 ${isChild ? 'pl-12' : ''}`}
            >
                {isChild && (
                    <CornerDownRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                )}
                <div className="flex flex-col">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onMove('up')}
                        disabled={isChild ? isFirst : false}
                        className="h-6 w-6"
                    >
                        <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onMove('down')}
                        disabled={isChild ? isLast : false}
                        className="h-6 w-6"
                    >
                        <ArrowDown className="h-3 w-3" />
                    </Button>
                </div>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span
                            className={
                                isChild ? 'text-sm font-medium' : 'font-medium'
                            }
                        >
                            {item.label}
                        </span>
                        {!item.is_active && (
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                Oculto
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.href}</p>
                </div>
                {onAddChild && (
                    <Button variant="ghost" size="sm" onClick={onAddChild}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Sub-item
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={onEdit}>
                    Editar
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
            {children && <ul className="divide-y">{children}</ul>}
        </li>
    );
}

SiteMenuIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
