// ======================================================
// ACTUALIZADOR DEL CATÁLOGO DE PERURES
// ======================================================
//
// Objetivo:
// - descubrir restaurantes peruanos en Madrid,
// - ampliar cobertura con varias consultas,
// - hacer una segunda pasada por distritos,
// - eliminar duplicados por Place ID,
// - dejar el catálogo disponible en window.catalogoPeruRes,
// - mantener compatibilidad con admin.html y validar-restaurantes.js.
//
// IMPORTANTE:
// Este archivo NO valida restaurantes ni guarda decisiones.
// Eso sigue siendo responsabilidad de validar-restaurantes.js.
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
    "peruvian restaurant"
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
    "comida peruana Torrejón de Ardoz"
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
// 9. FASE 1: BÚSQUEDA GENERAL POR ZONAS
// ======================================================

async function ejecutarBusquedaGeneral() {

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

async function ejecutarBusquedaDistritos() {

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


        console.log(
            "🍽️ Restaurantes únicos acumulados:",
            restaurantesUnicos.size
        );
    }
}


// ======================================================
// 11. ACTUALIZAR CATÁLOGO COMPLETO DE PERURES
// ======================================================

async function actualizarCatalogo() {

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


    // ==================================================
    // FASE 1
    // ==================================================

    await ejecutarBusquedaGeneral();


    // ==================================================
    // FASE 2
    // ==================================================

    await ejecutarBusquedaDistritos();


    // ==================================================
    // CONVERTIR MAP A ARRAY
    // ==================================================

    const catalogo =
        Array.from(
            restaurantesUnicos.values()
        );


    // ==================================================
    // RESULTADO FINAL
    // ==================================================

    console.log("");
    console.log("========================================");
    console.log("✅ RASTREO FINALIZADO");
    console.log(
        "🇵🇪 TOTAL RESTAURANTES ÚNICOS:",
        catalogo.length
    );
    console.log("========================================");


    console.log(
        "CATÁLOGO PERURES:",
        catalogo
    );


    // ==================================================
    // EXPONER CATÁLOGO PARA EL ADMIN Y EL VALIDADOR
    // ==================================================

    window.catalogoPeruRes =
        catalogo;


    // También dejamos una versión JSON preparada
    // para copiar desde consola si la necesitas.
    window.catalogoPeruResJSON =
        JSON.stringify(
            catalogo,
            null,
            4
        );


    console.log(
        "💾 Catálogo preparado en window.catalogoPeruRes"
    );


    console.log(
        "📄 JSON preparado en window.catalogoPeruResJSON"
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
