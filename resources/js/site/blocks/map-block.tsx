import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { BlockProps } from '@site/lib/basic-blocks-registry';

const RADIUS_CLASS: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    xl: 'rounded-xl',
};

const HEIGHT_CLASS: Record<string, string> = {
    sm: 'h-48',
    md: 'h-72',
    lg: 'h-96',
    xl: 'h-[28rem]',
};

type Coordinates = {
    lat: number;
    lng: number;
};

function parseCoordinates(input: string): Coordinates | null {
    const match = input
        .trim()
        .match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
    if (!match) return null;
    const lat = Number.parseFloat(match[1]);
    const lng = Number.parseFloat(match[2]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
}

function lookupCoordinates(query: string): Promise<Coordinates | null> {
    const cleaned = query.trim();
    if (!cleaned) return Promise.resolve(null);

    const direct = parseCoordinates(cleaned);
    if (direct) return Promise.resolve(direct);

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', cleaned);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

    return fetch(url.toString(), {
        headers: {
            Accept: 'application/json',
            'User-Agent': 'hostbol-cms/1.0',
        },
    })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: Array<{ lat: string; lon: string }>) => {
            if (!data.length) return null;
            const first = data[0];
            const lat = Number.parseFloat(first.lat);
            const lng = Number.parseFloat(first.lon);
            if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
            return { lat, lng };
        })
        .catch(() => null);
}

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })
    ._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function MapBlock({ content }: BlockProps) {
    const {
        address = '',
        lat = null,
        lng = null,
        zoom = 14,
        marker = true,
        scroll_wheel_zoom = false,
        height = 'md',
        radius = 'xl',
        caption = '',
    } = content as {
        address?: string;
        lat?: number | null;
        lng?: number | null;
        zoom?: number;
        marker?: boolean;
        scroll_wheel_zoom?: boolean;
        height?: string;
        radius?: string;
        caption?: string;
    };

    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [coords, setCoords] = useState<Coordinates | null>(() => {
        if (typeof lat === 'number' && typeof lng === 'number') {
            return { lat, lng };
        }
        return parseCoordinates(address);
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!coords || !containerRef.current) return;

        if (!mapRef.current) {
            mapRef.current = L.map(containerRef.current, {
                center: [coords.lat, coords.lng],
                zoom,
                scrollWheelZoom: scroll_wheel_zoom,
                attributionControl: true,
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(mapRef.current);
        } else {
            mapRef.current.setView([coords.lat, coords.lng], zoom);
        }

        if (marker) {
            if (!markerRef.current && mapRef.current) {
                markerRef.current = L.marker([coords.lat, coords.lng]).addTo(
                    mapRef.current,
                );
            } else if (markerRef.current) {
                markerRef.current.setLatLng([coords.lat, coords.lng]);
            }
        } else if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }

        const timer = setTimeout(() => {
            mapRef.current?.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [coords?.lat, coords?.lng, zoom, marker, scroll_wheel_zoom]);

    useEffect(() => {
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    function handleAddressBlur() {
        if (typeof lat === 'number' && typeof lng === 'number') return;
        const next = address.trim();
        if (!next) return;
        setError(null);
        lookupCoordinates(next).then((found) => {
            if (!found) {
                setError('No se encontró la dirección.');
                return;
            }
            setCoords(found);
        });
    }

    if (!coords) {
        return (
            <div
                className={`mx-auto flex w-full max-w-2xl flex-col items-center justify-center border-2 border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground ${HEIGHT_CLASS[height] ?? HEIGHT_CLASS['md']}`}
            >
                <MapPin className="mb-2 h-8 w-8" />
                <p>Ingresá una dirección o coordenadas en el panel derecho.</p>
                {error && (
                    <p className="mt-2 text-xs text-destructive">{error}</p>
                )}
            </div>
        );
    }

    const radiusCls = RADIUS_CLASS[radius] ?? RADIUS_CLASS['xl'];
    const heightCls = HEIGHT_CLASS[height] ?? HEIGHT_CLASS['md'];

    return (
        <figure className={`overflow-hidden bg-muted ${radiusCls}`}>
            <div
                ref={containerRef}
                className={`z-0 w-full ${heightCls}`}
                style={{ minHeight: '12rem' }}
            />
            {caption && (
                <figcaption className="bg-background/80 px-3 py-2 text-center text-xs text-muted-foreground">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}