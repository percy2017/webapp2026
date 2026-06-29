import { Clock, Instagram, Scissors, Sparkles, Users } from 'lucide-react';
import type { SectionProps } from '@site/lib/template-registry';

type TeamMember = {
    name?: string;
    role?: string;
    specialties?: Array<{ specialty?: string }>;
    photo_media_id?: number | { id: number; url?: string | null } | null;
    photo_url?: string;
    schedule?: string;
    instagram_handle?: string;
};

function resolvePhoto(item: TeamMember): { url: string | null } {
    const raw = item.photo_media_id;

    if (raw && typeof raw === 'object' && 'id' in raw) {
        const obj = raw as { id?: unknown; url?: unknown };

        if (typeof obj.url === 'string') {
            return { url: obj.url };
        }
    }

    if (typeof item.photo_url === 'string') {
        return { url: item.photo_url };
    }

    return { url: null };
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

// Columnas desktop. En mobile se renderiza un carrusel horizontal con
// snap (no grid) — ver TeamSection.
const COLS_CLASS: Record<string, string> = {
    '2': 'lg:grid-cols-2',
    '3': 'lg:grid-cols-3',
    '4': 'lg:grid-cols-4',
};

/**
 * Una card individual de miembro del equipo. Recibe `className`
 * adicional para que el wrapper móvil (carrusel) controle el ancho y
 * el wrapper desktop (grid) lo omita.
 */
function TeamMemberCard({
    member,
    primaryColor,
    isMinimal,
    className = '',
}: {
    member: TeamMember;
    primaryColor: string | undefined;
    isMinimal: boolean;
    className?: string;
}) {
    const photo = resolvePhoto(member);
    const name = member.name ?? '';
    const role = member.role ?? '';
    const specialties = Array.isArray(member.specialties)
        ? member.specialties
              .map((s) => String(s?.specialty ?? '').trim())
              .filter(Boolean)
        : [];
    const schedule = member.schedule ?? '';
    const handle = member.instagram_handle ?? '';

    return (
        <article
            className={`group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 ${className} ${
                isMinimal
                    ? 'bg-transparent'
                    : 'rounded-2xl border bg-card shadow-sm hover:shadow-md'
            }`}
        >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                {photo.url ? (
                    <img
                        src={photo.url}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary"
                        style={
                            primaryColor
                                ? {
                                      backgroundColor: `${primaryColor}1a`,
                                      color: primaryColor,
                                  }
                                : undefined
                        }
                        aria-hidden
                    >
                        {initials(name) || <Scissors className="h-12 w-12" />}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                {role && (
                    <p
                        className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-primary uppercase"
                        style={
                            primaryColor
                                ? {
                                      backgroundColor: `${primaryColor}1a`,
                                      color: primaryColor,
                                  }
                                : undefined
                        }
                    >
                        {role}
                    </p>
                )}
                {name && (
                    <h3 className="mt-2 text-lg font-semibold text-foreground">
                        {name}
                    </h3>
                )}

                {specialties.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                        {specialties.map((s, sIdx) => (
                            <li
                                key={`${s}-${sIdx}`}
                                className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                            >
                                <Sparkles className="h-3 w-3" />
                                {s}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    {schedule ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {schedule}
                        </span>
                    ) : (
                        <span />
                    )}
                    {handle && (
                        <a
                            href={`https://instagram.com/${handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={`Instagram de ${name}`}
                        >
                            <Instagram className="h-3.5 w-3.5" />
                            @{handle.replace('@', '')}
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

export function TeamSection({ content, theme }: SectionProps) {
    const {
        eyebrow = '',
        title = 'Nuestro equipo',
        subtitle = '',
        columns = '3',
        variant = 'card',
        items = [],
    } = content as {
        eyebrow?: string;
        title?: string;
        subtitle?: string;
        columns?: string;
        variant?: string;
        items?: TeamMember[];
    };

    const primaryColor = theme?.primary_color;
    const list: TeamMember[] = Array.isArray(items) ? items : [];
    const lgColsCls = COLS_CLASS[columns] ?? COLS_CLASS['3'];
    const isMinimal = variant === 'minimal';

    if (!title && list.length === 0) {
        return null;
    }

    return (
        <section
            id="team"
            className="border-b bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        >
            <div className="mx-auto w-full max-w-6xl">
                {(eyebrow || title || subtitle) && (
                    <div className="mx-auto max-w-2xl text-center">
                        {eyebrow && (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                style={
                                    primaryColor
                                        ? {
                                              backgroundColor: `${primaryColor}1a`,
                                              color: primaryColor,
                                          }
                                        : undefined
                                }
                            >
                                <Users className="h-3 w-3" />
                                {eyebrow}
                            </span>
                        )}
                        {title && (
                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {list.length === 0 ? (
                    <p className="mt-10 text-center text-sm text-muted-foreground">
                        Agregá miembros del equipo desde el panel derecho.
                    </p>
                ) : (
                    <>
                        {/* Mobile: carrusel horizontal con scroll-snap. Como
                            la card incluye aspect-[4/5] (foto alta), uso
                            w-[75vw] en vez de w-[85vw] para que el peek
                            lateral deje ver suficiente de la siguiente
                            card sin que esta se sienta apretada. */}
                        <div className="mt-10 lg:hidden">
                            <div
                                className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                role="region"
                                aria-label="Equipo"
                                aria-roledescription="carrusel"
                            >
                                {list.map((member, idx) => (
                                    <TeamMemberCard
                                        key={`m-${member.name}-${idx}`}
                                        member={member}
                                        primaryColor={primaryColor}
                                        isMinimal={isMinimal}
                                        className="w-[75vw] shrink-0 snap-start"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Desktop: grid de columnas. Render separado del
                            mobile porque Tailwind no resuelve breakpoints
                            distintos en el mismo wrapper. */}
                        <div
                            className={`mt-10 hidden gap-6 lg:grid ${lgColsCls}`}
                        >
                            {list.map((member, idx) => (
                                <TeamMemberCard
                                    key={`d-${member.name}-${idx}`}
                                    member={member}
                                    primaryColor={primaryColor}
                                    isMinimal={isMinimal}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
