// ======================================================
// ACTUALIZADOR DEL CATÁLOGO DE PERURES
// ======================================================
//
// Objetivo:
// - descubrir restaurantes peruanos en Madrid,
// - ampliar cobertura con varias consultas,
// - hacer una segunda pasada por distritos,
// - eliminar duplicados por Place ID,
// - sincronizar el catálogo persistente con Firebase por Place ID,
// - dejar el catálogo completo disponible en window.catalogoPeruRes,
// - mantener compatibilidad con admin.html y validar-restaurantes.js.
//
// IMPORTANTE:
// Este archivo NO valida restaurantes ni guarda decisiones.
// Sí persiste/sincroniza el catálogo en Firebase.
// Las decisiones siguen siendo responsabilidad de validar-restaurantes.js.
// ======================================================

console.log("Actualizador de PeruRes iniciado.");


// ======================================================
// 1. ZONAS DE BÚSQUEDA DE MADRID
// ======================================================

const zonasMadrid = [

    {
        nombre: "Centro",
        latitud: 40.4168,
        longitud: -3.7038
    },

    {
        nombre: "Norte",
        latitud: 40.5000,
        longitud: -3.7000
    },

    {
        nombre: "Noreste",
        latitud: 40.4700,
        longitud: -3.5900
    },

    {
        nombre: "Este",
        latitud: 40.4200,
        longitud: -3.5500
    },

    {
        nombre: "Sureste",
        latitud: 40.3600,
        longitud: -3.5900
    },

    {
        nombre: "Sur",
        latitud: 40.3000,
        longitud: -3.7000
    },

    {
        nombre: "Suroeste",
        latitud: 40.3300,
        longitud: -3.8200
    },

    {
        nombre: "Oeste",
        latitud: 40.4200,
        longitud: -3.8300
    },

    {
        nombre: "Noroeste",
        latitud: 40.5000,
        longitud: -3.8200
    }
];


// ======================================================
// 2. CONSULTAS GENERALES
// ======================================================
//
// Google puede devolver resultados distintos según
// las palabras utilizadas. Por eso no dependemos
// únicamente de "restaurante peruano".
// ======================================================

const consultasPeruanas = [
    "restaurante peruano",
    "comida peruana",
    "cevichería peruana",
    "pollería peruana",
    "chifa peruano",
    "gastronomía peruana",
    "cocina peruana",
    "peruvian restaurant",

    // Consultas adicionales para descubrir negocios que Google
    // puede clasificar de forma distinta en búsquedas equivalentes.
    "ceviche peruano",
    "pollo a la brasa peruano",
    "anticuchos peruanos",
    "comida criolla peruana",
    "marisquería peruana",
    "nikkei peruano"
];


// ======================================================
// 3. CONSULTAS ESPECÍFICAS POR DISTRITOS / ÁREAS
// ======================================================
//
// Esta segunda fase mejora la cobertura de negocios
// cuyo nombre no contiene palabras como "Perú" o
// "cevichería", pero Google sí clasifica como peruanos.
//
// Ejemplo típico:
// "BBTO Sabor Carretillero" en Usera.
// ======================================================

const consultasDistritos = [
    "restaurante peruano Usera",
    "comida peruana Usera",

    "restaurante peruano Carabanchel",
    "comida peruana Carabanchel",

    "restaurante peruano Puente de Vallecas",
    "comida peruana Puente de Vallecas",

    "restaurante peruano Villa de Vallecas",
    "comida peruana Villa de Vallecas",

    "restaurante peruano Tetuán",
    "comida peruana Tetuán",

    "restaurante peruano Arganzuela",
    "comida peruana Arganzuela",

    "restaurante peruano Latina Madrid",
    "comida peruana Latina Madrid",

    "restaurante peruano Chamberí",
    "comida peruana Chamberí",

    "restaurante peruano Centro Madrid",
    "comida peruana Centro Madrid",

    "restaurante peruano Ciudad Lineal",
    "comida peruana Ciudad Lineal",

    "restaurante peruano San Blas Madrid",
    "comida peruana San Blas Madrid",

    "restaurante peruano Hortaleza",
    "comida peruana Hortaleza",

    "restaurante peruano Chamartín",
    "comida peruana Chamartín",

    "restaurante peruano Moncloa Madrid",
    "comida peruana Moncloa Madrid",

    "restaurante peruano Salamanca Madrid",
    "comida peruana Salamanca Madrid",

    "restaurante peruano Alcobendas",
    "comida peruana Alcobendas",

    "restaurante peruano Torrejón de Ardoz",
    "comida peruana Torrejón de Ardoz",

    "restaurante peruano Getafe",
    "comida peruana Getafe",

    "restaurante peruano Leganés",
    "comida peruana Leganés",

    "restaurante peruano Fuenlabrada",
    "comida peruana Fuenlabrada",

    "restaurante peruano Alcorcón",
    "comida peruana Alcorcón",

    "restaurante peruano Móstoles",
    "comida peruana Móstoles",

    "restaurante peruano Parla",
    "comida peruana Parla",

    "restaurante peruano Coslada",
    "comida peruana Coslada",

    "restaurante peruano San Sebastián de los Reyes",
    "comida peruana San Sebastián de los Reyes"
];


// ======================================================
// 4. RESTAURANTES ÚNICOS
// ======================================================
//
// Map evita duplicados utilizando el Place ID.
// ======================================================

const restaurantesUnicos = new Map();


// ======================================================
// 5. CONFIGURACIÓN DEL RASTREO
// ======================================================

const MAXIMO_PAGINAS = 3;
const RESULTADOS_POR_PAGINA = 20;
const RADIO_BUSQUEDA_METROS = 12000;


// ======================================================
// 6. PEQUEÑA PAUSA ENTRE PETICIONES
// ======================================================
//
// No es obligatoria para la lógica, pero hace el rastreo
// un poco más estable y evita encadenar peticiones de forma
// innecesariamente agresiva.
// ======================================================

function esperar(ms) {
    return new Promise(
        function (resolver) {
            setTimeout(resolver, ms);
        }
    );
}


// ======================================================
// 7. GUARDAR RESULTADOS SIN DUPLICADOS
// ======================================================

function guardarRestaurantesEncontrados(restaurantes) {

    if (!Array.isArray(restaurantes)) {
        return;
    }


    restaurantes.forEach(
        function (restaurante) {

            if (!restaurante || !restaurante.id) {
                return;
            }


            restaurantesUnicos.set(
                restaurante.id,
                restaurante
            );
        }
    );
}


// ======================================================
// 8. BUSCAR UNA CONSULTA EN UNA ZONA
// ======================================================

async function buscarConsultaEnZona(
    zona,
    consulta
) {

    const url =
        "https://places.googleapis.com/v1/places:searchText";


    let pageToken = null;


    for (
        let pagina = 1;
        pagina <= MAXIMO_PAGINAS;
        pagina++
    ) {

        const datosBusqueda = {

            textQuery:
                consulta,

            pageSize:
                RESULTADOS_POR_PAGINA,

            locationBias: {
                circle: {
                    center: {
                        latitude:
                            zona.latitud,

                        longitude:
                            zona.longitud
                    },

                    radius:
                        RADIO_BUSQUEDA_METROS
                }
            }
        };


        if (pageToken) {
            datosBusqueda.pageToken =
                pageToken;
        }


        try {

            const respuesta =
                await fetch(
                    url,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "X-Goog-Api-Key":
                                GOOGLE_API_KEY,

                            "X-Goog-FieldMask":
                                "places.id," +
                                "places.displayName," +
                                "places.location," +
                                "places.formattedAddress," +
                                "places.rating," +
                                "places.userRatingCount," +
                                "places.primaryType," +
                                "places.primaryTypeDisplayName," +
                                "nextPageToken"
                        },

                        body:
                            JSON.stringify(
                                datosBusqueda
                            )
                    }
                );


            if (!respuesta.ok) {

                const textoError =
                    await respuesta.text();


                throw new Error(
                    "Google Places respondió " +
                    respuesta.status +
                    ": " +
                    textoError
                );
            }


            const datos =
                await respuesta.json();


            console.log(
                "Zona:",
                zona.nombre,
                "| Consulta:",
                consulta,
                "| Página:",
                pagina
            );


            guardarRestaurantesEncontrados(
                datos.places
            );


            pageToken =
                datos.nextPageToken ||
                null;


            if (!pageToken) {
                break;
            }


            // Pequeña pausa antes de solicitar
            // la siguiente página.
            await esperar(250);

        } catch (error) {

            console.error(
                "Error buscando:",
                zona.nombre,
                consulta,
                error
            );


            break;
        }
    }
}


// ======================================================
// 8.1 PROGRESO REAL DEL RASTREO
// ======================================================

/*
 * El progreso se calcula a partir del trabajo real:
 *
 * - cada consulta general completada;
 * - cada consulta por distrito completada;
 * - sincronización final con Firebase.
 *
 * No usamos temporizadores falsos para mover el porcentaje.
 */

function crearControlProgreso(
    callbackProgreso
) {

    const totalConsultas =
        zonasMadrid.length *
        consultasPeruanas.length +
        consultasDistritos.length;


    let consultasCompletadas =
        0;


    function emitir(
        porcentaje,
        mensaje
    ) {

        const porcentajeSeguro =
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        porcentaje
                    )
                )
            );


        if (
            typeof callbackProgreso ===
            "function"
        ) {

            callbackProgreso(
                porcentajeSeguro,
                mensaje
            );
        }
    }


    function registrarConsulta(
        mensaje
    ) {

        consultasCompletadas++;


        /*
         * Reservamos el 95% para el rastreo.
         * El 5% restante corresponde a la sincronización
         * y lectura final de Firebase.
         */
        const porcentaje =
            totalConsultas > 0
                ? (
                    consultasCompletadas /
                    totalConsultas
                ) * 95
                : 95;


        emitir(
            porcentaje,
            mensaje
        );
    }


    return {
        emitir,
        registrarConsulta
    };
}


// ======================================================
// 9. FASE 1: BÚSQUEDA GENERAL POR ZONAS
// ======================================================

async function ejecutarBusquedaGeneral(
    controlProgreso
) {

    console.log("");
    console.log("========================================");
    console.log("🔎 FASE 1 - BÚSQUEDA GENERAL POR ZONAS");
    console.log("========================================");


    for (const zona of zonasMadrid) {

        console.log("");
        console.log("📍 ZONA:", zona.nombre);


        for (const consulta of consultasPeruanas) {

            console.log(
                "🔎 Buscando:",
                consulta
            );


            await buscarConsultaEnZona(
                zona,
                consulta
            );


            if (controlProgreso) {

                controlProgreso.registrarConsulta(
                    "Rastreando " +
                    zona.nombre +
                    " · " +
                    consulta
                );
            }


            console.log(
                "🍽️ Restaurantes únicos acumulados:",
                restaurantesUnicos.size
            );
        }
    }
}


// ======================================================
// 10. FASE 2: BÚSQUEDA ESPECÍFICA POR DISTRITOS
// ======================================================

async function ejecutarBusquedaDistritos(
    controlProgreso
) {

    console.log("");
    console.log("========================================");
    console.log("🔎 FASE 2 - BÚSQUEDA POR DISTRITOS");
    console.log("========================================");


    const zonaMadridGeneral = {
        nombre:
            "Madrid Distritos",

        latitud:
            40.4168,

        longitud:
            -3.7038
    };


    for (const consulta of consultasDistritos) {

        console.log(
            "🔎 Buscando por distrito:",
            consulta
        );


        await buscarConsultaEnZona(
            zonaMadridGeneral,
            consulta
        );


        if (controlProgreso) {

            controlProgreso.registrarConsulta(
                "Rastreando distrito · " +
                consulta
            );
        }


        console.log(
            "🍽️ Restaurantes únicos acumulados:",
            restaurantesUnicos.size
        );
    }
}


// ======================================================
// 10.1 CATÁLOGO PERSISTENTE EN FIREBASE
// ======================================================

/*
 * A partir de esta versión, Google Places deja de ser
 * únicamente una fuente temporal para la sesión.
 *
 * El catálogo persistente vive en:
 *
 *     perures/catalogo/<Place ID>
 *
 * Las decisiones del administrador continúan separadas en:
 *
 *     perures/decisiones/<Place ID>
 *
 * De esta forma, actualizar el catálogo NO borra ni mezcla
 * las decisiones VALIDADO / REVISAR / DESCARTADO.
 */

function obtenerReferenciaCatalogoFirebase() {

    if (
        typeof firebase === "undefined" ||
        !firebase.database
    ) {

        throw new Error(
            "Firebase no está disponible. Revisa el orden de los scripts en admin.html."
        );
    }


    return firebase
        .database()
        .ref(
            "perures/catalogo"
        );
}


async function obtenerCatalogoPersistente() {

    const snapshot =
        await obtenerReferenciaCatalogoFirebase()
            .once(
                "value"
            );


    if (!snapshot.exists()) {

        return {};
    }


    return snapshot.val() || {};
}


function prepararRestauranteParaFirebase(
    restaurante
) {

    /*
     * Realtime Database no admite undefined.
     * JSON.parse/stringify elimina esas propiedades y
     * conserva el objeto de Google Places en un formato
     * seguro para persistir.
     */
    return JSON.parse(
        JSON.stringify(
            restaurante
        )
    );
}


async function sincronizarCatalogoConFirebase(
    catalogoDescubierto
) {

    const catalogoExistente =
        await obtenerCatalogoPersistente();


    const actualizaciones = {};


    let nuevos = 0;
    let existentes = 0;


    catalogoDescubierto.forEach(
        function (restaurante) {

            if (
                !restaurante ||
                !restaurante.id
            ) {

                return;
            }


            if (
                Object.prototype.hasOwnProperty.call(
                    catalogoExistente,
                    restaurante.id
                )
            ) {

                existentes++;

            } else {

                nuevos++;
            }


            /*
             * Upsert por Place ID:
             *
             * - si existe, actualizamos sus datos;
             * - si no existe, lo creamos;
             * - NO eliminamos restaurantes antiguos que
             *   Google no haya devuelto en este rastreo.
             */
            // Preparamos los datos nuevos que acabamos
            // de recibir de Google Places.
            const restauranteActualizado =
                prepararRestauranteParaFirebase(
                    restaurante
                );


            // ======================================================
            // CONSERVAR DATOS ENRIQUECIDOS
            // ======================================================
            //
            // Algunos datos no proceden de Google Places.
            // Por ejemplo, el teléfono lo obtendremos después
            // mediante nuestro script obtener-telefono.js.
            //
            // Si el restaurante ya existe en Firebase y tiene
            // teléfono, lo conservamos para que una futura
            // actualización del catálogo no lo elimine.
            // ======================================================

            const restauranteAnterior =
                catalogoExistente[
                restaurante.id
                ];


            if (
                restauranteAnterior &&
                restauranteAnterior.telefono
            ) {

                restauranteActualizado.telefono =
                    restauranteAnterior.telefono;


                // También conservaremos estos campos cuando
                // posteriormente los añadamos desde el script.

                if (
                    restauranteAnterior.telefonoFuente
                ) {

                    restauranteActualizado.telefonoFuente =
                        restauranteAnterior.telefonoFuente;
                }


                if (
                    restauranteAnterior.telefonoActualizado
                ) {

                    restauranteActualizado.telefonoActualizado =
                        restauranteAnterior.telefonoActualizado;
                }
            }


            // Finalmente guardamos el restaurante actualizado,
            // pero manteniendo su teléfono si ya lo tenía.

            actualizaciones[
                restaurante.id
            ] =
                restauranteActualizado;


        }
    );


    if (
        Object.keys(
            actualizaciones
        ).length > 0
    ) {

        await obtenerReferenciaCatalogoFirebase()
            .update(
                actualizaciones
            );
    }


    /*
     * Volvemos a leer Firebase después del upsert.
     * Este es el catálogo completo y persistente:
     * antiguos + encontrados/actualizados + nuevos.
     */
    const catalogoFinalObjeto =
        await obtenerCatalogoPersistente();


    const catalogoFinal =
        Object.values(
            catalogoFinalObjeto
        ).filter(
            Boolean
        );


    console.log(
        "🔥 Sincronización Firebase terminada."
    );

    console.log(
        "➕ Restaurantes nuevos:",
        nuevos
    );

    console.log(
        "🔄 Restaurantes encontrados que ya existían:",
        existentes
    );

    console.log(
        "💾 Total persistente en Firebase:",
        catalogoFinal.length
    );


    return {
        catalogo:
            catalogoFinal,

        nuevos:
            nuevos,

        existentes:
            existentes
    };
}


// ======================================================
// 11. ACTUALIZAR CATÁLOGO COMPLETO DE PERURES
// ======================================================

async function actualizarCatalogo(
    callbackProgreso = null
) {

    console.log("========================================");
    console.log("🇵🇪 INICIANDO CATÁLOGO PERURES");
    console.log("========================================");


    /*
     * MUY IMPORTANTE:
     * limpiamos el Map antes de cada rastreo.
     *
     * Si no hacemos esto y pulsamos varias veces
     * "Actualizar catálogo", pueden quedar resultados
     * antiguos acumulados en memoria.
     */
    restaurantesUnicos.clear();


    const controlProgreso =
        crearControlProgreso(
            callbackProgreso
        );


    controlProgreso.emitir(
        0,
        "Preparando rastreo..."
    );


    // ==================================================
    // FASE 1
    // ==================================================

    await ejecutarBusquedaGeneral(
        controlProgreso
    );


    // ==================================================
    // FASE 2
    // ==================================================

    await ejecutarBusquedaDistritos(
        controlProgreso
    );


    // ==================================================
    // CONVERTIR RESULTADOS DEL RASTREO A ARRAY
    // ==================================================

    const catalogoDescubierto =
        Array.from(
            restaurantesUnicos.values()
        );


    console.log("");
    console.log("========================================");
    console.log("✅ RASTREO DE GOOGLE FINALIZADO");
    console.log(
        "🇵🇪 RESTAURANTES ÚNICOS ENCONTRADOS:",
        catalogoDescubierto.length
    );
    console.log("========================================");


    // ==================================================
    // SINCRONIZAR CON EL CATÁLOGO PERSISTENTE
    // ==================================================

    /*
     * MUY IMPORTANTE:
     *
     * No reemplazamos Firebase con el rastreo actual.
     * Hacemos un UPSERT por Place ID.
     *
     * Esto evita perder un restaurante antiguo simplemente
     * porque Google no lo devolvió en una ejecución concreta.
     */
    controlProgreso.emitir(
        96,
        "Guardando catálogo en Firebase..."
    );


    const resultadoSincronizacion =
        await sincronizarCatalogoConFirebase(
            catalogoDescubierto
        );


    const catalogo =
        resultadoSincronizacion.catalogo;


    controlProgreso.emitir(
        100,
        "Catálogo actualizado."
    );


    // ==================================================
    // EXPONER CATÁLOGO COMPLETO AL ADMIN / VALIDADOR
    // ==================================================

    window.catalogoPeruRes =
        catalogo;


    /*
     * Conservamos esta variable por compatibilidad y para
     * poder exportar/copiar el catálogo completo si hace falta.
     */
    window.catalogoPeruResJSON =
        JSON.stringify(
            catalogo,
            null,
            4
        );


    console.log(
        "💾 Catálogo persistente disponible en window.catalogoPeruRes:",
        catalogo.length
    );


    console.log(
        "📄 JSON completo preparado en window.catalogoPeruResJSON"
    );


    /*
     * Conservamos el retorno como ARRAY para no romper admin.html,
     * que actualmente utiliza catalogo.length.
     *
     * Las estadísticas se adjuntan como una propiedad adicional
     * del propio array y también quedan disponibles globalmente.
     */
    const estadisticasActualizacion = {
        encontrados:
            catalogoDescubierto.length,

        nuevos:
            resultadoSincronizacion.nuevos,

        actualizados:
            resultadoSincronizacion.existentes,

        total:
            catalogo.length
    };


    catalogo.estadisticasActualizacion =
        estadisticasActualizacion;


    window.estadisticasActualizacionPeruRes =
        estadisticasActualizacion;


    console.log(
        "📊 RESUMEN ACTUALIZACIÓN:",
        estadisticasActualizacion
    );


    return catalogo;
}


// ======================================================
// 12. EXPONER FUNCIÓN GLOBALMENTE
// ======================================================
//
// admin.html llama directamente a actualizarCatalogo().
// Al ser este archivo un <script> normal ya queda global,
// pero lo dejamos explícito para que sea más claro.
// ======================================================

window.actualizarCatalogo =
    actualizarCatalogo;
