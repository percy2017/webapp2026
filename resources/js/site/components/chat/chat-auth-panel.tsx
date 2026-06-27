import { Loader2, Lock, Mail, MessageCircle, Phone, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { csrfJson } from '@/lib/csrf';
import { login as loginRoute, register as registerRoute } from '@/routes/widget/auth';

type Props = {
    onAuthed: () => void;
};

export function ChatAuthPanel({ onAuthed }: Props) {
    const [tab, setTab] = useState<'login' | 'register'>('login');

    return (
        <div className="flex h-full flex-col">
            <div className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-3">
                <MessageCircle className="h-4 w-4" />
                <p className="text-sm font-semibold">Chat en vivo</p>
            </div>

            <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as 'login' | 'register')}
                className="flex flex-1 flex-col"
            >
                <div className="border-b px-3 pt-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                        <TabsTrigger value="register">Registrarse</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent
                    value="login"
                    className="m-0 flex-1 overflow-y-auto p-4"
                >
                    <LoginForm onSuccess={onAuthed} />
                </TabsContent>

                <TabsContent
                    value="register"
                    className="m-0 flex-1 overflow-y-auto p-4"
                >
                    <RegisterForm onSuccess={onAuthed} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await csrfJson(loginRoute.url(), {
                method: 'POST',
                body: { email, password },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(
                    data?.message ??
                        data?.errors?.email?.[0] ??
                        'Credenciales incorrectas.',
                );

                return;
            }

            window.location.reload();
            onSuccess();
        } catch {
            setError('Error de conexión. Intentá de nuevo.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="chat-email" className="text-xs">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        id="chat-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="pl-9"
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="chat-password" className="text-xs">
                    Contraseña
                </Label>
                <div className="relative">
                    <Lock className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        id="chat-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="pl-9"
                    />
                </div>
            </div>

            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
                {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
        </form>
    );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const response = await csrfJson(registerRoute.url(), {
                method: 'POST',
                body: { name, email, phone },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErrors(data?.errors ?? {});
                return;
            }

            window.location.reload();
            onSuccess();
        } catch {
            setErrors({ email: ['Error de conexión.'] });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-xs">
                    Nombre
                </Label>
                <div className="relative">
                    <UserIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        id="reg-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        className="pl-9"
                    />
                </div>
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name[0]}</p>
                )}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-xs">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="pl-9"
                    />
                </div>
                {errors.email && (
                    <p className="text-xs text-destructive">
                        {errors.email[0]}
                    </p>
                )}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="reg-phone" className="text-xs">
                    Teléfono
                </Label>
                <div className="relative">
                    <Phone className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        id="reg-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        autoComplete="tel"
                        placeholder="+54 9 11 5555 4444"
                        className="pl-9"
                    />
                </div>
                {errors.phone && (
                    <p className="text-xs text-destructive">
                        {errors.phone[0]}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
                Al registrarte podrás chatear con nuestro equipo.
            </p>
        </form>
    );
}