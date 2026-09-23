const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// ======================================================
// FIREBASE - CATÁLOGO REAL DE PERURES
// ======================================================
//
// PROCESO DE TELÉFONOS:
// - Lee perures/catalogo.
// - Selecciona todos los restaurantes que todavía no tienen telefono.
// - El teléfono se obtiene por scraping con Playwright.
// - El Place ID se usa SOLO para guardar en el nodo correcto.
// - Se guarda únicamente el campo telefono.
// ======================================================

const FIREBASE_DATABASE_URL =
    "https://portofolio-marvin-default-rtdb.europe-west1.firebasedatabase.app";


async function obtenerRestaurantesSinTelefono() {

    const respuesta =
        await fetch(
            `${FIREBASE_DATABASE_URL}/perures/catalogo.json`
        );

    if (!respuesta.ok) {
        throw new Error(
            `Firebase respondió ${respuesta.status} al leer el catálogo.`
        );
    }

    const catalogo =
        await respuesta.json();

    if (!catalogo) {
        return [];
    }

    return Object.entries(catalogo)
        .map(
            ([placeId, restaurante]) => ({
                placeId,
                ...restaurante
            })
        )
        .filter(
            restaurante =>
                !restaurante.telefono
        );

}


async function guardarTelefono(
    placeId,
    telefono
) {

    const placeIdSeguro =
        encodeURIComponent(placeId);

    const respuesta =
        await fetch(
            `${FIREBASE_DATABASE_URL}/perures/catalogo/${placeIdSeguro}.json`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        telefono
                    })
            }
        );

    if (!respuesta.ok) {
        throw new Error(
            `Firebase respondió ${respuesta.status} al guardar el teléfono.`
        );
    }
}


// ======================================================
// FORMATEAR SEGUNDOS
// ======================================================

function formatearTiempo(segundos) {

    const totalSegundos =
        Math.max(
            0,
            Math.round(segundos)
        );

    const minutos =
        Math.floor(
            totalSegundos / 60
        );

    const segundosRestantes =
        totalSegundos % 60;

    if (minutos > 0) {

        return (
            `${minutos} min ${segundosRestantes} s`
        );

    }

    return `${segundosRestantes} s`;
}


// ======================================================
// BARRA DE PROGRESO PARA CONSOLA
// ======================================================

function crearBarraProgreso(
    procesados,
    total
) {

    const longitudBarra = 20;

    const proporcion =
        total > 0
            ? procesados / total
            : 0;

    const bloquesCompletos =
        Math.round(
            proporcion * longitudBarra
        );

    const bloquesPendientes =
        longitudBarra -
        bloquesCompletos;

    return (
        "[" +
        "█".repeat(
            bloquesCompletos
        ) +
        "░".repeat(
            bloquesPendientes
        ) +
        "]"
    );
}


// ======================================================
// OBTENER TELÉFONO DE UN RESTAURANTE
// ======================================================

async function obtenerTelefono(
    pagina,
    nombre,
    direccion
) {

    const busqueda =
        encodeURIComponent(
            `${nombre} ${direccion}`
        );

    const url =
        `https://www.google.com/maps/search/${busqueda}`;

    console.log(
        "Buscando:",
        nombre
    );


    await pagina.goto(
        url,
        {
            waitUntil: "domcontentloaded",
            timeout: 60000
        }
    );


    // ==================================================
    // CONSENTIMIENTO DE COOKIES
    // ==================================================

    try {

        const botonRechazar =
            pagina.getByRole(
                "button",
                {
                    name: /rechazar todo/i
                }
            );

        if (
            await botonRechazar.isVisible({
                timeout: 3000
            })
        ) {

            console.log(
                "Aviso de cookies detectado."
            );

            await botonRechazar.click();

            console.log(
                "Cookies rechazadas."
            );

        }

    } catch (error) {

        /*
         * Es normal que, después del primer restaurante,
         * el aviso de cookies ya no vuelva a aparecer.
         */

    }


    // ==================================================
    // ESPERAR A QUE GOOGLE MAPS TERMINE DE CARGAR
    // ==================================================

    await pagina.waitForTimeout(
        5000
    );


    // ==================================================
    // BUSCAR POSIBLE TELÉFONO
    // ==================================================

    const selectoresTelefono = [

        'button[data-item-id^="phone"]',

        '[data-item-id^="phone"]',

        'a[href^="tel:"]'

    ];


    let telefono = null;


    for (
        const selector
        of selectoresTelefono
    ) {

        const elemento =
            pagina.locator(
                selector
            ).first();


        if (
            await elemento.count() > 0
        ) {

            const texto =
                await elemento
                    .innerText()
                    .catch(
                        () => null
                    );


            const ariaLabel =
                await elemento
                    .getAttribute(
                        "aria-label"
                    );


            const href =
                await elemento
                    .getAttribute(
                        "href"
                    );


            telefono =
                texto ||
                ariaLabel ||
                href;


            if (telefono) {

                break;

            }

        }

    }


    // ==================================================
    // LIMPIAR TELÉFONO
    // ==================================================

    if (telefono) {

        telefono =
            telefono
                .replace(
                    /^Teléfono:\s*/i,
                    ""
                )
                .replace(
                    /^tel:/i,
                    ""
                )
                .replace(
                    /[^\d+\s()-]/g,
                    ""
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

    }


    return telefono;
}


// ======================================================
// CREAR LOG PERMANENTE DE LA EJECUCIÓN
// ======================================================

function guardarLogEjecucion(datos) {

    const carpetaLogs = path.join(__dirname, "logs");
    fs.mkdirSync(carpetaLogs, { recursive: true });

    const ahora = new Date();
    const dosDigitos = numero => String(numero).padStart(2, "0");

    const fechaArchivo =
        `${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())}` +
        `_${dosDigitos(ahora.getHours())}-${dosDigitos(ahora.getMinutes())}-${dosDigitos(ahora.getSeconds())}`;

    const rutaLog =
        path.join(carpetaLogs, `telefonos-${fechaArchivo}.txt`);

    const lineas = [
        "====================================",
        "RESULTADO PERURES - TELÉFONOS",
        "====================================",
        `Fecha: ${ahora.toLocaleString("es-ES")}`,
        "",
        `Teléfonos encontrados: ${datos.encontrados}`,
        `Sin teléfono: ${datos.noEncontrados}`,
        `Errores: ${datos.errores}`,
        `Total procesados: ${datos.totalProcesados}`,
        `TIEMPO TOTAL: ${formatearTiempo(datos.segundosTotales)} (${datos.segundosTotales.toFixed(1)} s)`,
        `PROMEDIO: ${datos.promedioFinal.toFixed(1)} s por restaurante`,
        "",
        "====================================",
        "SIN TELÉFONO",
        "===================================="
    ];

    if (datos.restaurantesSinTelefono.length === 0) {
        lineas.push("Ninguno.");
    } else {
        datos.restaurantesSinTelefono.forEach((restaurante, indice) => {
            lineas.push(
                "",
                `${indice + 1}. Restaurante: ${restaurante.nombre}`,
                `   Place ID: ${restaurante.placeId}`,
                `   Dirección: ${restaurante.direccion || "Sin dirección"}`
            );
        });
    }

    lineas.push(
        "",
        "",
        "====================================",
        "ERRORES",
        "===================================="
    );

    if (datos.restaurantesConError.length === 0) {
        lineas.push("Ninguno.");
    } else {
        datos.restaurantesConError.forEach((registro, indice) => {
            lineas.push(
                "",
                `${indice + 1}. Restaurante: ${registro.nombre}`,
                `   Place ID: ${registro.placeId}`,
                `   Dirección: ${registro.direccion || "Sin dirección"}`,
                `   Error: ${registro.error}`
            );
        });
    }

    fs.writeFileSync(rutaLog, lineas.join("\n"), "utf8");
    return rutaLog;
}


// ======================================================
// PROCESAR RESTAURANTES PENDIENTES
// ======================================================

async function procesarRestaurantes() {

    const restaurantes =
        await obtenerRestaurantesSinTelefono();


    console.log(
        `Restaurantes pendientes de teléfono: ${restaurantes.length}`
    );


    if (restaurantes.length === 0) {

        console.log(
            "No hay restaurantes pendientes de teléfono."
        );

        return;
    }


    const navegador =
        await chromium.launch({
            headless: false
        });


    const pagina =
        await navegador.newPage();


    console.log(
        "\n===================================="
    );

    console.log(
        "TELÉFONOS DESDE FIREBASE - PERURES"
    );

    console.log(
        "====================================\n"
    );


    // ==================================================
    // TEMPORIZADOR GENERAL
    // ==================================================

    const inicioTotal =
        Date.now();


    let encontrados = 0;

    let noEncontrados = 0;

    let errores = 0;

    const restaurantesSinTelefono = [];
    const restaurantesConError = [];


    console.log(
        "Temporizador iniciado...\n"
    );


    // ==================================================
    // PROCESAR RESTAURANTES
    // ==================================================

    for (
        let i = 0;
        i < restaurantes.length;
        i++
    ) {

        const restaurante =
            restaurantes[i];


        const inicioRestaurante =
            Date.now();


        console.log(
            `[${i + 1}/${restaurantes.length}]`
        );


        console.log(
            "Restaurante:",
            restaurante.displayName?.text ||
            restaurante.nombre ||
            restaurante.placeId
        );


        try {

            const telefono =
                await obtenerTelefono(
                    pagina,
                    restaurante.displayName?.text ||
                    restaurante.nombre ||
                    "",
                    restaurante.formattedAddress ||
                    restaurante.direccion ||
                    ""
                );


            if (telefono) {

                encontrados++;

                console.log(
                    "Teléfono encontrado:",
                    telefono
                );


                await guardarTelefono(
                    restaurante.placeId,
                    telefono
                );


                console.log(
                    "Teléfono guardado en Firebase."
                );

            } else {

                noEncontrados++;

                restaurantesSinTelefono.push({
                    nombre:
                        restaurante.displayName?.text ||
                        restaurante.nombre ||
                        restaurante.placeId,
                    placeId: restaurante.placeId,
                    direccion:
                        restaurante.formattedAddress ||
                        restaurante.direccion ||
                        ""
                });

                console.log(
                    "No se encontró teléfono."
                );

            }

        } catch (error) {

            errores++;

            restaurantesConError.push({
                nombre:
                    restaurante.displayName?.text ||
                    restaurante.nombre ||
                    restaurante.placeId,
                placeId: restaurante.placeId,
                direccion:
                    restaurante.formattedAddress ||
                    restaurante.direccion ||
                    "",
                error: error.message
            });

            console.error(
                "Error:",
                error.message
            );

        }


        // ==================================================
        // TIEMPO DEL RESTAURANTE ACTUAL
        // ==================================================

        const finRestaurante =
            Date.now();


        const segundosRestaurante =
            (
                (
                    finRestaurante -
                    inicioRestaurante
                ) / 1000
            );


        // ==================================================
        // PROGRESO GENERAL
        // ==================================================

        const procesados =
            i + 1;


        const porcentaje =
            Math.round(
                (
                    procesados /
                    restaurantes.length
                ) * 100
            );


        const segundosTranscurridos =
            (
                (
                    finRestaurante -
                    inicioTotal
                ) / 1000
            );


        const promedioSegundos =
            segundosTranscurridos /
            procesados;


        const restaurantesRestantes =
            restaurantes.length -
            procesados;


        const segundosRestantesEstimados =
            promedioSegundos *
            restaurantesRestantes;


        const barra =
            crearBarraProgreso(
                procesados,
                restaurantes.length
            );


        console.log(
            `Tiempo restaurante: ${segundosRestaurante.toFixed(1)} s`
        );


        console.log(
            `Progreso: ${barra} ${porcentaje}%`
        );


        console.log(
            `Procesados: ${procesados}/${restaurantes.length}`
        );


        console.log(
            `Tiempo transcurrido: ${formatearTiempo(segundosTranscurridos)}`
        );


        console.log(
            `Promedio: ${promedioSegundos.toFixed(1)} s por restaurante`
        );


        if (
            restaurantesRestantes > 0
        ) {

            console.log(
                `Tiempo restante estimado: ${formatearTiempo(segundosRestantesEstimados)}`
            );

        } else {

            console.log(
                "Tiempo restante estimado: 0 s"
            );

        }


        console.log(
            "------------------------------------"
        );


        // ==================================================
        // PAUSA ENTRE BÚSQUEDAS
        // ==================================================

        if (i < restaurantes.length - 1) {

            await pagina.waitForTimeout(
                2000
            );
        }

    }


    // ==================================================
    // RESULTADO FINAL
    // ==================================================

    const finTotal =
        Date.now();


    const segundosTotales =
        (
            (
                finTotal -
                inicioTotal
            ) / 1000
        );


    const promedioFinal =
        restaurantes.length > 0
            ? segundosTotales /
            restaurantes.length
            : 0;


    console.log(
        "\n===================================="
    );

    console.log(
        "PROCESO TERMINADO"
    );

    console.log(
        "===================================="
    );


    console.log(
        `Teléfonos encontrados: ${encontrados}`
    );


    console.log(
        `Sin teléfono: ${noEncontrados}`
    );


    console.log(
        `Errores: ${errores}`
    );


    console.log(
        `Total procesados: ${restaurantes.length}`
    );


    console.log(
        `TIEMPO TOTAL: ${formatearTiempo(segundosTotales)} (${segundosTotales.toFixed(1)} s)`
    );


    console.log(
        `PROMEDIO: ${promedioFinal.toFixed(1)} s por restaurante`
    );


    console.log(
        "====================================\n"
    );


    const rutaLog =
        guardarLogEjecucion({
            encontrados,
            noEncontrados,
            errores,
            restaurantesSinTelefono,
            restaurantesConError,
            totalProcesados: restaurantes.length,
            segundosTotales,
            promedioFinal
        });

    console.log("Log guardado en:");
    console.log(rutaLog);
    console.log();


    // Cerramos Chromium al terminar el proceso.
    await navegador.close();

}


// ======================================================
// INICIO
// ======================================================

procesarRestaurantes()
    .catch(
        error => {
            console.error(
                "ERROR GENERAL:",
                error.message
            );

            process.exitCode = 1;
        }
    );
