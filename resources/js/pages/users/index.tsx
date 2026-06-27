import { Head, Link, router, usePage } from '@inertiajs/react';
import { Loader2, Mail, Phone, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useInitials } from '@/hooks/use-initials';
import { destroy, edit, index } from '@/routes/users';
import type { Paginated } from '@/types';

type Role = { id: number; name: string };

type UserItem = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    roles_list: string;
    created_at: string;
};

type Filters = { search: string };

type Props = {
    users: Paginated<UserItem>;
    filters: Filters;
    roles: Role[];
};

export default function UsersIndex({ users, filters }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const getInitials = useInitials();
    const [search, setSearch] = useState(filters.search);
    const [isSearching, setIsSearching] = useState(false);
    const [deleting, setDeleting] = useState<UserItem | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            setIsSearching(true);
            router.get(index().url, params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['users', 'filters'],
                onFinish: () => setIsSearching(false),
            });
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search]);

    function handleDelete() {
        if (!deleting) return;
        router.delete(destroy(deleting.id).url, {
            onFinish: () => setDeleting(null),
        });
    }

    return (
        <>
            <Head title="Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {props.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {props.flash.success}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-20"
                        />
                        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                            {isSearching && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {search && !isSearching && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/admin/users/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border bg-card">
                    <table className="w-full">
                        <thead className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Usuario</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Teléfono</th>
                                <th className="px-4 py-3">Roles</th>
                                <th className="px-4 py-3 text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                                    >
                                        {search
                                            ? 'Sin resultados para tu búsqueda.'
                                            : 'Aún no hay usuarios.'}
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="text-sm hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={edit(user.id).url}
                                                className="flex items-center gap-3"
                                            >
                                                <Avatar className="h-9 w-9">
                                                    {user.avatar_url ? (
                                                        <AvatarImage
                                                            src={user.avatar_url}
                                                            alt={user.name}
                                                        />
                                                    ) : null}
                                                    <AvatarFallback>
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">
                                                    {user.name}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <Mail className="h-3 w-3" />
                                                {user.email}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {user.phone ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {user.phone}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {user.roles_list || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleting(user)
                                                }
                                                aria-label="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            Mostrando {users.data.length} de {users.total}{' '}
                            usuarios
                        </p>
                        <div className="flex gap-2">
                            {users.links?.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={`rounded-md border px-3 py-1 text-sm ${
                                        link.active
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : link.url
                                              ? 'hover:bg-accent'
                                              : 'pointer-events-none opacity-50'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="¿Eliminar usuario?"
                description={
                    deleting
                        ? `Se eliminará "${deleting.name}". Esta acción no se puede deshacer.`
                        : 'Esta acción no se puede deshacer.'
                }
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '/admin' },
        { title: 'Usuarios', href: '/admin/users' },
    ],
};