type CookieRecord = { name: string; value: string };

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`));

    return match
        ? decodeURIComponent(match.split('=').slice(1).join('='))
        : null;
}

function xsrfHeaders(): Record<string, string> {
    const token = readCookie('XSRF-TOKEN');

    return token ? { 'X-XSRF-TOKEN': token } : {};
}

type JsonRequestInit = Omit<RequestInit, 'headers' | 'body'> & {
    body?: unknown;
    headers?: Record<string, string>;
};

export async function csrfJson(
    url: string,
    init: JsonRequestInit = {},
): Promise<Response> {
    const isFormData =
        typeof FormData !== 'undefined' && init.body instanceof FormData;

    const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...xsrfHeaders(),
        ...(init.headers ?? {}),
    };

    if (init.body !== undefined && !isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const body =
        init.body === undefined
            ? undefined
            : isFormData
              ? (init.body as FormData)
              : JSON.stringify(init.body);

    return fetch(url, {
        ...init,
        headers,
        body,
        credentials: 'same-origin',
    });
}
