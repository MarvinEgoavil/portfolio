// ==========================================================
// THIRD PARTY API
// Comunicación con el Cloudflare Worker
// ==========================================================

const API_BASE_URL =
    'https://portfolioapi.marvinegoavilz.workers.dev';

async function leerRespuesta(respuesta) {
    let resultado;

    try {
        resultado = await respuesta.json();
    } catch {
        throw new Error(
            'El servidor devolvió una respuesta no válida.'
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        const error = new Error(
            resultado.error ||
            'No se pudo completar la solicitud.'
        );

        error.status = respuesta.status;
        error.data = resultado;

        throw error;
    }

    return resultado;
}

async function postJSON(ruta, datos) {
    const respuesta = await fetch(
        `${API_BASE_URL}${ruta}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        }
    );

    return leerRespuesta(respuesta);
}

async function getJSON(ruta) {
    const respuesta = await fetch(
        `${API_BASE_URL}${ruta}`,
        {
            method: 'GET',
            cache: 'no-store'
        }
    );

    return leerRespuesta(respuesta);
}

export async function obtenerEstadoTercero() {
    return getJSON('/tercero/estado');
}

export async function desbloquearTercero(
    clave,
    turnstileToken
) {
    return postJSON('/tercero/desbloquear', {
        clave,
        turnstileToken
    });
}

export async function enviarMensajeTercero(
    token,
    numero,
    mensaje
) {
    return postJSON('/tercero/enviar', {
        token,
        numero,
        mensaje
    });
}
