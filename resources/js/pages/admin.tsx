import { Head } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    ExternalLink,
    MessageSquare,
    Share2,
    Users,
    Inbox,
    Clock,
    Zap,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { QrShareButton } from '@site/components/qr-share-button';

type Socket = {
    status: 'connected' | 'disconnected';
    host: string;
    port: number | string;
    scheme: string;
};

type Metrics = {
    total_messages: number;
    today_messages: number;
    total_chats: number;
    open_chats: number;
    unread: number;
    peak_hour: string | null;
    peak_hour_count: number;
};

type HourlyPoint = {
    hour: string;
    count: number;
};

type SiteCard = {
    url: string;
    template: string | null;
    site_name: string;
};

type Props = {
    socket: Socket;
    metrics: Metrics;
    hourly: HourlyPoint[];
    site_card: SiteCard;
};

const breadcrumbs = [{ title: 'Admin', href: '/admin' }];

export default function AdminDashboard({
    socket,
    metrics,
    hourly,
    site_card,
}: Props) {
    const connected = socket.status === 'connected';
    const maxHour = Math.max(1, ...hourly.map((h) => h.count));
    const total = metrics.total_messages;
    const today = metrics.today_messages;

    return (
        <>
            <Head title="Panel" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 sm:p-6 lg:p-8">
                <div
                    className={`relative overflow-hidden rounded-2xl border p-6 ${
                        connected
                            ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-background'
                            : 'border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-background to-background'
                    }`}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                                    connected
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                }`}
                            >
                                {connected ? (
                                    <Wifi className="h-7 w-7" />
                                ) : (
                                    <WifiOff className="h-7 w-7" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Socket{' '}
                                        {connected
                                            ? 'conectado'
                                            : 'desconectado'}
                                    </h1>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase ${
                                            connected
                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                connected
                                                    ? 'bg-emerald-500'
                                                    : 'bg-rose-500'
                                            }`}
                                        />
                                        {connected ? 'online' : 'offline'}
                                    </span>
                                </div>
                                <p className="mt-1 font-mono text-xs text-muted-foreground">
                                    {socket.scheme}://{socket.host}:
                                    {socket.port}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Activity className="h-4 w-4" />
                            <span>Reverb en port 3001</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        icon={MessageSquare}
                        label="Mensajes hoy"
                        value={today}
                        accent="text-blue-600 dark:text-blue-400"
                    />
                    <MetricCard
                        icon={Users}
                        label="Chats abiertos"
                        value={metrics.open_chats}
                        sub={`${metrics.total_chats} totales`}
                        accent="text-violet-600 dark:text-violet-400"
                    />
                    <MetricCard
                        icon={Inbox}
                        label="Sin leer"
                        value={metrics.unread}
                        accent={
                            metrics.unread > 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-muted-foreground'
                        }
                    />
                    <MetricCard
                        icon={Zap}
                        label="Pico de hoy"
                        value={metrics.peak_hour_count}
                        sub={
                            metrics.peak_hour
                                ? `a las ${metrics.peak_hour}`
                                : '—'
                        }
                        accent="text-amber-600 dark:text-amber-400"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-1">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                                    <Share2 className="h-4 w-4 text-primary" />
                                    Tu tarjeta digital
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Compartí este sitio con clientes vía QR.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={site_card.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted"
                            >
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                    {site_card.url}
                                </span>
                            </a>

                            <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-xs">
                                <span className="text-muted-foreground">
                                    Plantilla activa
                                </span>
                                <span className="font-mono font-medium">
                                    {site_card.template ?? '—'}
                                </span>
                            </div>

                            <div className="w-full">
                                <QrShareButton
                                    url={site_card.url}
                                    variant="inline"
                                    label="Ver QR y descargar"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Mensajes por hora
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Actividad de las últimas 24 horas · {total}{' '}
                                    en total
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>ahora</span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-x-0 top-0 h-px bg-border" />
                            <div className="absolute inset-x-0 top-1/2 h-px bg-border/40" />
                            <div className="absolute inset-x-0 bottom-0 h-px bg-border" />

                            <div
                                className="grid grid-cols-24 gap-1.5 pt-1"
                                style={{
                                    gridTemplateColumns:
                                        'repeat(24, minmax(0, 1fr))',
                                }}
                            >
                                {hourly.map((point, idx) => {
                                    const heightPct =
                                        (point.count / maxHour) * 100;
                                    const isLast = idx === hourly.length - 1;

                                    return (
                                        <div
                                            key={point.hour + idx}
                                            className="group relative flex h-32 flex-col items-center justify-end"
                                        >
                                            <div
                                                className={`w-full rounded-t transition-all ${
                                                    point.count === 0
                                                        ? 'h-1 bg-muted'
                                                        : isLast
                                                          ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                                                          : 'bg-gradient-to-t from-primary/70 to-primary'
                                                }`}
                                                style={{
                                                    height:
                                                        point.count === 0
                                                            ? '4px'
                                                            : `${Math.max(heightPct, 8)}%`,
                                                }}
                                                title={`${point.hour} — ${point.count} mensajes`}
                                            />
                                            {(idx === 0 ||
                                                isLast ||
                                                (idx + 1) % 6 === 0) && (
                                                <span className="mt-1 text-[10px] text-muted-foreground tabular-nums">
                                                    {point.hour}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    sub,
    accent,
}: {
    icon: typeof Activity;
    label: string;
    value: number;
    sub?: string;
    accent?: string;
}) {
    return (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {label}
                </span>
                <Icon
                    className={`h-4 w-4 ${accent ?? 'text-muted-foreground'}`}
                />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight tabular-nums">
                    {value.toLocaleString('es')}
                </span>
                {sub && (
                    <span className="text-xs text-muted-foreground">{sub}</span>
                )}
            </div>
        </div>
    );
}

AdminDashboard.layout = {
    breadcrumbs,
};
