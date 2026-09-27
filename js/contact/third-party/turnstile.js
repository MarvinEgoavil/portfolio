// ==========================================================
// TURNSTILE
// Ciclo de vida del widget Cloudflare Turnstile
// ==========================================================

const SITE_KEY = '0x4AAAAAAFDSCDpEwCi8yFgN';

let widgetId = null;
let tokenActual = '';
let contenedorActual = null;
let mensajeVerificacion = null;


// ==========================================================
// ESTADO VISUAL
// ==========================================================

function eliminarMensajeVerificacion() {
    if (mensajeVerificacion) {
        mensajeVerificacion.remove();
        mensajeVerificacion = null;
    }
}


function crearMensajeVerificacion(referencia) {
    if (!referencia || !referencia.isConnected) {
        return;
    }

    eliminarMensajeVerificacion();

    mensajeVerificacion = document.createElement('div');
    mensajeVerificacion.className = 'turnstile-verificado';
    mensajeVerificacion.setAttribute('role', 'status');
    mensajeVerificacion.setAttribute('aria-live', 'polite');

    mensajeVerificacion.innerHTML =
        '<i class="fas fa-shield-alt" aria-hidden="true"></i>' +
        '<span>Verificación de seguridad completada</span>';

    referencia.insertAdjacentElement(
        'afterend',
        mensajeVerificacion
    );
}


function mostrarVerificacionCompletada() {
    if (!contenedorActual || !contenedorActual.isConnected) {
        return;
    }

    contenedorActual.hidden = true;
    crearMensajeVerificacion(contenedorActual);
}


function mostrarTurnstile() {
    eliminarMensajeVerificacion();

    if (contenedorActual && contenedorActual.isConnected) {
        contenedorActual.hidden = false;
    }
}


// ==========================================================
// LIMPIAR REFERENCIAS
// ==========================================================

function limpiarReferencias() {
    widgetId = null;
    tokenActual = '';
    contenedorActual = null;

    eliminarMensajeVerificacion();
}


// ==========================================================
// MONTAR
// ==========================================================

export function montarTurnstile(
    contenedor,
    { onSuccess = null, onExpired = null, onError = null } = {}
) {
    if (!window.turnstile) {
        console.error(
            'Cloudflare Turnstile todavía no está disponible.'
        );

        return null;
    }

    if (!contenedor || !contenedor.isConnected) {
        console.error(
            'El contenedor de Turnstile no está disponible.'
        );

        return null;
    }

    // Nunca reutilizamos un widget perteneciente
    // a un panel anterior.
    destruirTurnstile();

    contenedorActual = contenedor;
    contenedorActual.hidden = false;

    try {
        widgetId = window.turnstile.render(
            contenedorActual,
            {
                sitekey: SITE_KEY,
                theme: 'dark',

                // Turnstile trabaja en segundo plano.
                // Solo muestra interfaz cuando Cloudflare
                // necesita interacción del usuario.
                appearance: 'interaction-only',
                execution: 'render',

                callback(token) {
                    tokenActual = token;

                    console.log(
                        'Turnstile verificado correctamente.'
                    );

                    mostrarVerificacionCompletada();

                    if (typeof onSuccess === 'function') {
                        onSuccess(token);
                    }
                },

                'expired-callback'() {
                    tokenActual = '';

                    mostrarTurnstile();

                    if (typeof onExpired === 'function') {
                        onExpired();
                    }
                },

                'error-callback'() {
                    tokenActual = '';

                    mostrarTurnstile();

                    if (typeof onError === 'function') {
                        onError();
                    }
                }
            }
        );

        return widgetId;

    } catch (error) {
        console.error(
            'No se pudo renderizar Turnstile:',
            error
        );

        limpiarReferencias();

        return null;
    }
}


// ==========================================================
// TOKEN
// ==========================================================

export function obtenerTokenTurnstile() {
    /*
     * El callback de Cloudflare es nuestra fuente de verdad.
     *
     * Evitamos llamar continuamente a getResponse(), porque
     * si Cloudflare ya retiró internamente el widget podemos
     * terminar consultando una referencia que dejó de existir.
     */
    return tokenActual;
}


// ==========================================================
// RESETEAR
// ==========================================================

export function resetearTurnstile() {
    tokenActual = '';

    eliminarMensajeVerificacion();

    if (!window.turnstile) {
        limpiarReferencias();
        return false;
    }

    if (
        widgetId === null ||
        !contenedorActual ||
        !contenedorActual.isConnected
    ) {
        limpiarReferencias();
        return false;
    }

    contenedorActual.hidden = false;

    try {
        window.turnstile.reset(widgetId);

        return true;

    } catch (error) {
        console.warn(
            'El widget anterior de Turnstile ya no existe. ' +
            'Será necesario crear uno nuevo.'
        );

        /*
         * No seguimos conservando un widgetId inválido.
         */
        limpiarReferencias();

        return false;
    }
}


// ==========================================================
// SUSPENDER / ABANDONAR "A TERCERO"
// ==========================================================

export function suspenderTurnstile() {
    /*
     * El panel va a desaparecer del DOM.
     *
     * Por tanto NO conservamos widgetId ni token.
     * Un token de Turnstile no debe reutilizarse después
     * de destruir el contexto visual que lo generó.
     */
    destruirTurnstile();
}


// ==========================================================
// DESTRUIR DEFINITIVAMENTE
// ==========================================================

export function destruirTurnstile() {
    tokenActual = '';

    eliminarMensajeVerificacion();

    const idAnterior = widgetId;
    const contenedorAnterior = contenedorActual;

    /*
     * Limpiamos primero nuestro estado.
     * Así nunca queda un widgetId fantasma aunque
     * Cloudflare lance una excepción durante remove().
     */
    widgetId = null;
    contenedorActual = null;

    if (contenedorAnterior?.isConnected) {
        contenedorAnterior.hidden = false;
    }

    if (!window.turnstile || idAnterior === null) {
        return;
    }

    try {
        window.turnstile.remove(idAnterior);

    } catch (error) {
        /*
         * Si Cloudflare ya eliminó internamente el widget,
         * no necesitamos intentar utilizarlo otra vez.
         */
        console.warn(
            'Turnstile ya había liberado el widget anterior.'
        );
    }
}


// ==========================================================
// ESTADO
// ==========================================================

export function hayTurnstileMontado() {
    return (
        widgetId !== null &&
        contenedorActual !== null &&
        contenedorActual.isConnected
    );
}


export function hayVerificacionTurnstile() {
    return Boolean(tokenActual);
}