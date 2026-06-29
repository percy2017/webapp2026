/**
 * Helper compartido para reproducir el sonido de "mensaje nuevo" del chat.
 *
 *   /audio/bell.mp3 (public/, served at /audio/bell.mp3)
 *
 * Estrategia:
 *   - Crea una sola instancia de HTMLAudioElement perezosa (al primer uso)
 *     para no gastar memoria ni reflowar el DOM en cada mensaje.
 *   - setAudioVolume() queda a medio volumen — un bell agresivo satura
 *     rápido cuando llegan varios mensajes seguidos.
 *   - Si el autoplay del navegador bloquea la primera reproducción (lo
 *     habitual: el usuario todavía no interactuó con la página), se hace
 *     un `unlockAudio()` silencioso desde el primer click/keydown del
 *     documento; a partir de ahí `.play()` pasa siempre.
 *   - playChatBell() es fire-and-forget: cualquier error se loguea con
 *     `console.warn` y NO rompe el flujo del chat.
 */

const BELL_URL = '/audio/bell.mp3';

let audio: HTMLAudioElement | null = null;
let unlocked = false;

function ensureAudio(): HTMLAudioElement {
    if (audio) {
        return audio;
    }

    const a = new Audio(BELL_URL);
    a.preload = 'auto';
    a.volume = 0.5;
    audio = a;

    return a;
}

/**
 * Pre-carga el archivo y lo "desbloquea" para sortear la autoplay policy
 * de Chrome/Safari/Firefox. Llamar después del primer user gesture
 * (click, keydown, etc.). Es seguro llamar varias veces — el handler
 * se registra una sola vez.
 */
export function unlockChatBell(): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (unlocked) {
        ensureAudio();

        return;
    }

    const a = ensureAudio();

    // Forzar la carga por si está en idle.
    try {
        a.load();
    } catch {
        // ignore
    }

    const unlock = () => {
        // Reproducir y pausar inmediatamente — eso satisface la regla
        // de "user-initiated playback" para futuros .play() sin gesto.
        a.play()
            .then(() => {
                a.pause();
                a.currentTime = 0;
            })
            .catch(() => {
                // Algunos navegadores siguen bloqueando — no es un error
                // crítico: el primer .play() real del usuario lo destraba.
            })
            .finally(() => {
                unlocked = true;
            });
    };

    // El primer click/keydown/touchstart del documento desbloquea el
    // audio. Se registra una sola vez.
    const onFirstGesture = () => {
        unlock();

        document.removeEventListener('click', onFirstGesture, true);
        document.removeEventListener('keydown', onFirstGesture, true);
        document.removeEventListener('touchstart', onFirstGesture, true);
    };

    document.addEventListener('click', onFirstGesture, true);
    document.addEventListener('keydown', onFirstGesture, true);
    document.addEventListener('touchstart', onFirstGesture, true);
}

/**
 * Reproduce el bell. Si hay un .play() en curso (mensaje anterior
 * todavía sonando), lo rebobina al inicio para evitar superposiciones
 * raras. Devuelve una Promise<void> para quien quiera esperarlo; en
 * general se usa fire-and-forget.
 */
export function playChatBell(): Promise<void> {
    const a = ensureAudio();

    try {
        a.currentTime = 0;
        const p = a.play();

        if (p && typeof p.then === 'function') {
            return p
                .then(() => undefined)
                .catch((err) => {
                    console.warn('[chat-bell] play() rejected:', err);
                });
        }

        return Promise.resolve();
    } catch (err) {
        console.warn('[chat-bell] play() threw:', err);

        return Promise.resolve();
    }
}
