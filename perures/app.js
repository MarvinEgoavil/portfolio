// ======================================================
// VARIABLES GLOBALES
// ======================================================

// Aquí guardaremos los restaurantes que encontremos.
// Más adelante utilizaremos esta lista para el buscador.
const restaurantesEncontrados = [];


// ======================================================
// ZONAS DE BÚSQUEDA DE MADRID
// ======================================================

// Creamos varios puntos repartidos por Madrid.
//
// La idea es que Google haga una búsqueda
// alrededor de cada uno de estos puntos.
//
// Así evitamos depender de una sola búsqueda
// que devuelve como máximo unos 60 resultados.
const zonasMadrid = [
    // Centro de Madrid.
    {
        nombre: "Centro",
        latitud: 40.4168,
        longitud: -3.7038
    },

    // Norte.
    {
        nombre: "Norte",
        latitud: 40.5000,
        longitud: -3.7000
    },

    // Noreste.
    {
        nombre: "Noreste",
        latitud: 40.4700,
        longitud: -3.5900
    },

    // Este.
    {
        nombre: "Este",
        latitud: 40.4200,
        longitud: -3.5500
    },

    // Sureste.
    {
        nombre: "Sureste",
        latitud: 40.3600,
        longitud: -3.5900
    },

    // Sur.
    {
        nombre: "Sur",
        latitud: 40.3000,
        longitud: -3.7000
    },

    // Suroeste.
    {
        nombre: "Suroeste",
        latitud: 40.3300,
        longitud: -3.8200
    },

    // Oeste.
    {
        nombre: "Oeste",
        latitud: 40.4200,
        longitud: -3.8300
    },

    // Noroeste.
    {
        nombre: "Noroeste",
        latitud: 40.5000,
        longitud: -3.8200
    }
];


// ======================================================
// MAPA
// ======================================================

// Creamos el mapa.
// Al principio lo centramos provisionalmente en Madrid.
const mapa = L.map("map").setView([40.4168, -3.7038], 12);


// Escuchamos cada vez que el usuario cambia el zoom del mapa.
mapa.on("zoomend", function () {

    // Obtenemos el nivel de zoom actual.
    const zoomActual = mapa.getZoom();

    // Buscamos todos los nombres de restaurantes
    // que existen actualmente en el mapa.
    const nombresRestaurantes =
        document.querySelectorAll(".marcador-nombre");

    // Recorremos uno por uno todos los nombres.
    nombresRestaurantes.forEach(function (nombre) {

        // Si el usuario ha hecho bastante zoom,
        // mostramos los nombres.
        if (zoomActual >= 16) {

            // Hacemos visible el nombre.
            nombre.style.display = "block";

        } else {

            // Si el mapa está más alejado,
            // ocultamos nuevamente el nombre.
            nombre.style.display = "none";
        }
    });
});


// Añadimos el mapa visual de OpenStreetMap.
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        // Mostramos los créditos obligatorios de OpenStreetMap.
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(mapa);


// ======================================================
// GEOLOCALIZACIÓN DEL USUARIO
// ======================================================

// Comprobamos si el navegador tiene disponible la geolocalización.
if ("geolocation" in navigator) {

    // Pedimos al navegador la posición actual del usuario.
    navigator.geolocation.getCurrentPosition(

        // Esta función se ejecutará si conseguimos la ubicación.
        function (posicion) {

            // Guardamos la latitud donde está el usuario.
            const latitud = posicion.coords.latitude;

            // Guardamos la longitud donde está el usuario.
            const longitud = posicion.coords.longitude;


            // Buscamos restaurantes peruanos
            // en varias zonas de Madrid.
            //
            // También le pasamos la ubicación del usuario
            // para poder calcular después la distancia
            // desde él hasta cada restaurante.
            buscarRestaurantesEnMadrid(latitud, longitud);


            // Mostramos las coordenadas en la consola.
            // Esto nos servirá para comprobar que realmente
            // las estamos recibiendo.
            console.log("Latitud:", latitud);
            console.log("Longitud:", longitud);


            // Movemos el mapa hasta la ubicación del usuario.
            // El número 16 indica el nivel de zoom.
            mapa.setView([latitud, longitud], 16);


            // Creamos un círculo azul en la posición del usuario.
            L.circleMarker(
                [latitud, longitud],
                {
                    // Tamaño del círculo.
                    radius: 10,

                    // Color del borde.
                    color: "#ffffff",

                    // Grosor del borde.
                    weight: 3,

                    // Color interior.
                    fillColor: "#4285F4",

                    // Opacidad del interior.
                    fillOpacity: 1
                }
            )
                // Añadimos el círculo al mapa.
                .addTo(mapa)

                // Le ponemos un pequeño mensaje.
                .bindPopup("📍 Estás aquí")

                // Abrimos el mensaje automáticamente.
                .openPopup();
        },


        // Esta función se ejecutará si ocurre algún problema.
        function (error) {

            // Mostramos el problema como una advertencia.
            console.warn("No se pudo obtener la ubicación:", error);

            // También mostramos un aviso visible.
            alert(
                "No pude obtener tu ubicación. " +
                "Revisa que hayas permitido el acceso a la ubicación."
            );
        },


        // Opciones para obtener la ubicación.
        {
            // Intentamos conseguir una ubicación precisa.
            enableHighAccuracy: true,

            // Esperamos como máximo 10 segundos.
            timeout: 10000,

            // No queremos utilizar una ubicación antigua guardada.
            maximumAge: 0
        }
    );

} else {

    // Si el navegador ni siquiera soporta geolocalización,
    // mostramos este aviso.
    alert("Tu navegador no permite utilizar geolocalización.");
}


// ======================================================
// BÚSQUEDA GENERAL POR TODA MADRID
// ======================================================

// Esta función recorrerá todas las zonas
// que hemos definido arriba.
async function buscarRestaurantesEnMadrid(
    latitudUsuario,
    longitudUsuario
) {

    // Creamos un Map para guardar restaurantes únicos.
    //
    // Usamos el ID de Google como clave.
    //
    // Si el mismo restaurante aparece
    // en Centro y también en Sur,
    // solo se guardará una vez.
    const restaurantesUnicos = new Map();


    // Recorremos una por una
    // todas las zonas de Madrid.
    for (const zona of zonasMadrid) {

        // Mostramos en consola
        // qué zona estamos buscando.
        console.log(
            "Buscando zona:",
            zona.nombre
        );


        // Pedimos los restaurantes
        // de esta zona concreta.
        const restaurantesZona =
            await buscarRestaurantesZona(
                zona.latitud,
                zona.longitud
            );


        // Recorremos todos los restaurantes
        // encontrados en esa zona.
        restaurantesZona.forEach(function (restaurante) {

            // Guardamos el restaurante
            // utilizando su ID de Google.
            //
            // Si ese ID ya existe,
            // simplemente se sustituye
            // por el mismo restaurante.
            restaurantesUnicos.set(
                restaurante.id,
                restaurante
            );
        });
    }


    // Convertimos el Map
    // en un array normal.
    const restaurantes =
        Array.from(restaurantesUnicos.values());


    // Mostramos el total real
    // después de eliminar duplicados.
    console.log(
        "TOTAL restaurantes únicos en Madrid:",
        restaurantes.length
    );


    // Ahora pintamos todos
    // los restaurantes en el mapa.
    pintarRestaurantes(
        restaurantes,
        latitudUsuario,
        longitudUsuario
    );
}


// ======================================================
// CÁLCULO DE DISTANCIA
// ======================================================

// Esta función calcula la distancia aproximada
// entre dos puntos del mapa.
//
// Recibe:
// - lat1 = latitud del usuario.
// - lon1 = longitud del usuario.
// - lat2 = latitud del restaurante.
// - lon2 = longitud del restaurante.
//
// Devuelve la distancia en kilómetros.
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {

    // Radio aproximado de la Tierra en kilómetros.
    const RADIO_TIERRA_KM = 6371;


    // Convertimos la diferencia de latitud
    // de grados a radianes.
    const diferenciaLatitud =
        (lat2 - lat1) * Math.PI / 180;


    // Convertimos la diferencia de longitud
    // de grados a radianes.
    const diferenciaLongitud =
        (lon2 - lon1) * Math.PI / 180;


    // Convertimos la primera latitud
    // de grados a radianes.
    const latitud1Radianes =
        lat1 * Math.PI / 180;


    // Convertimos la segunda latitud
    // de grados a radianes.
    const latitud2Radianes =
        lat2 * Math.PI / 180;


    // Aplicamos la fórmula de Haversine.
    //
    // Esta fórmula sirve para calcular
    // la distancia entre dos puntos de la Tierra.
    const a =
        Math.sin(diferenciaLatitud / 2) *
        Math.sin(diferenciaLatitud / 2) +

        Math.sin(diferenciaLongitud / 2) *
        Math.sin(diferenciaLongitud / 2) *

        Math.cos(latitud1Radianes) *
        Math.cos(latitud2Radianes);


    // Calculamos el ángulo entre ambos puntos.
    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    // Multiplicamos por el radio de la Tierra
    // para obtener kilómetros.
    const distancia =
        RADIO_TIERRA_KM * c;


    // Devolvemos la distancia con un decimal.
    //
    // Ejemplo:
    // 3.2678 km
    //
    // se convierte en:
    // 3.3
    return distancia.toFixed(1);
}


// ======================================================
// COLORES SEGÚN LA VALORACIÓN
// ======================================================

// Esta función decide qué color tendrá
// un restaurante según su puntuación.
function obtenerColorRating(rating) {

    // Si tiene 4.8 o más,
    // usamos dorado.
    if (rating >= 4.8) {
        return "#D4AF37";
    }


    // Si tiene entre 4.5 y 4.7,
    // usamos verde fuerte.
    if (rating >= 4.5) {
        return "#18A558";
    }


    // Si tiene entre 4.0 y 4.4,
    // usamos verde claro.
    if (rating >= 4.0) {
        return "#7CB342";
    }


    // Si tiene entre 3.5 y 3.9,
    // usamos amarillo.
    if (rating >= 3.5) {
        return "#FBC02D";
    }


    // Si tiene entre 3.0 y 3.4,
    // usamos naranja.
    if (rating >= 3.0) {
        return "#F57C00";
    }


    // Si tiene menos de 3,
    // usamos rojo.
    return "#D32F2F";
}


// ======================================================
// BÚSQUEDA DE UNA ZONA
// ======================================================

// Esta función busca restaurantes peruanos
// alrededor de un punto concreto.
//
// Puede devolver hasta 3 páginas
// de aproximadamente 20 resultados cada una.
async function buscarRestaurantesZona(
    latitudZona,
    longitudZona
) {

    // Dirección de Google Places.
    const url =
        "https://places.googleapis.com/v1/places:searchText";


    // Aquí guardaremos los restaurantes
    // de esta zona.
    const restaurantesZona = [];


    // Al principio no existe token.
    let pageToken = null;


    // Pedimos como máximo 3 páginas.
    for (let pagina = 1; pagina <= 3; pagina++) {

        // Creamos la petición.
        const datosBusqueda = {

            // Buscamos restaurantes peruanos.
            textQuery: "restaurantes peruanos",

            // Máximo de resultados por página.
            pageSize: 20,

            // Limitamos la búsqueda
            // alrededor del centro de esta zona.
            locationBias: {

                // Usamos un círculo.
                circle: {

                    // Centro de la zona.
                    center: {

                        // Latitud de la zona.
                        latitude: latitudZona,

                        // Longitud de la zona.
                        longitude: longitudZona
                    },

                    // Radio de 12 km.
                    //
                    // Es suficientemente grande
                    // para cubrir barrios cercanos
                    // pero pequeño para que Google
                    // no priorice restaurantes
                    // de toda Madrid.
                    radius: 12000
                }
            }
        };


        // Si tenemos token,
        // pedimos la siguiente página.
        if (pageToken) {

            // Añadimos el token.
            datosBusqueda.pageToken = pageToken;
        }


        try {

            // Hacemos la petición.
            const respuesta = await fetch(
                url,
                {
                    // Método POST.
                    method: "POST",

                    // Cabeceras necesarias.
                    headers: {

                        // Indicamos JSON.
                        "Content-Type": "application/json",

                        // Nuestra clave.
                        "X-Goog-Api-Key": GOOGLE_API_KEY,

                        // Campos que necesitamos.
                        "X-Goog-FieldMask":
                            "places.id," +
                            "places.displayName," +
                            "places.location," +
                            "places.formattedAddress," +
                            "places.rating," +
                            "places.userRatingCount," +
                            "nextPageToken"
                    },

                    // Enviamos los datos.
                    body: JSON.stringify(datosBusqueda)
                }
            );


            // Convertimos la respuesta
            // a JavaScript.
            const datos = await respuesta.json();


            // Si hay lugares...
            if (datos.places) {

                // Los añadimos a la lista.
                restaurantesZona.push(
                    ...datos.places
                );
            }


            // Guardamos el token
            // de la siguiente página.
            pageToken =
                datos.nextPageToken || null;


            // Si no existe siguiente página,
            // terminamos.
            if (!pageToken) {
                break;
            }

        } catch (error) {

            // Mostramos el error.
            console.error(
                "Error buscando zona:",
                error
            );

            // Salimos del bucle.
            break;
        }
    }


    // Devolvemos todos los restaurantes
    // encontrados en esta zona.
    return restaurantesZona;
}


// ======================================================
// PINTAR RESTAURANTES
// ======================================================

// Esta función recibe una lista de restaurantes
// y los muestra sobre el mapa.
function pintarRestaurantes(
    restaurantes,
    latitudUsuario,
    longitudUsuario
) {

    // Recorremos todos
    // los restaurantes encontrados.
    restaurantes.forEach(function (restaurante) {

        // Guardamos la latitud.
        const latRestaurante =
            restaurante.location.latitude;


        // Guardamos la longitud.
        const lonRestaurante =
            restaurante.location.longitude;


        // Guardamos el nombre.
        const nombreRestaurante =
            restaurante.displayName.text;


        // Guardamos la valoración.
        const rating =
            restaurante.rating || 0;


        // Guardamos las reseñas.
        const cantidadResenas =
            restaurante.userRatingCount || 0;


        // Calculamos la distancia
        // desde el usuario.
        const distanciaKm =
            calcularDistanciaKm(
                latitudUsuario,
                longitudUsuario,
                latRestaurante,
                lonRestaurante
            );


        // Obtenemos el color.
        const colorRating =
            obtenerColorRating(rating);


        // Creamos el HTML
        // del marcador.
        const contenidoMarcador = `
            <div class="marcador-restaurante">

                <div
                    class="marcador-nombre"
                    title="${nombreRestaurante}"
                >
                    ${nombreRestaurante}
                </div>

                <div
                    class="marcador-rating"
                    style="background-color: ${colorRating};"
                >
                    ⭐ ${rating}
                </div>

                <div class="marcador-distancia">
                    ${distanciaKm} km
                </div>

                <div
                    class="marcador-punto"
                    style="background-color: ${colorRating};"
                ></div>

            </div>
        `;


        // Creamos el icono personalizado.
        const iconoPersonalizado =
            L.divIcon({

                // Quitamos el icono estándar.
                className: "",

                // Añadimos nuestro HTML.
                html: contenidoMarcador,

                // Tamaño.
                iconSize: [80, 65],

                // Punto de anclaje.
                iconAnchor: [40, 60]
            });


        // Creamos el marcador.
        const marcador =
            L.marker(
                [
                    latRestaurante,
                    lonRestaurante
                ],
                {
                    // Usamos nuestro icono.
                    icon: iconoPersonalizado
                }
            )

                // Lo añadimos al mapa.
                .addTo(mapa)

                // Añadimos la información.
                .bindPopup(
                    "<strong>" +
                    nombreRestaurante +
                    "</strong>" +

                    "<br>" +

                    "⭐ " +
                    rating +

                    "<br>" +

                    cantidadResenas +
                    " reseñas" +

                    "<br>" +

                    "📍 " +
                    distanciaKm +
                    " km"
                );


        // Guardamos el restaurante
        // en nuestra lista global.
        restaurantesEncontrados.push({

            // ID.
            id: restaurante.id,

            // Nombre.
            nombre: nombreRestaurante,

            // Valoración.
            rating: rating,

            // Reseñas.
            resenas: cantidadResenas,

            // Distancia.
            distancia: distanciaKm,

            // Latitud.
            latitud: latRestaurante,

            // Longitud.
            longitud: lonRestaurante,

            // Marcador.
            marcador: marcador
        });
    });
}

// ======================================================
// PRUEBA: BUSCAR LUPITA DIRECTAMENTE
// ======================================================

async function probarBusquedaLupita() {

    const url =
        "https://places.googleapis.com/v1/places:searchText";

    const datosBusqueda = {
        textQuery: "Salones Cuzco Lupita Madrid",
        pageSize: 20
    };

    try {

        const respuesta = await fetch(
            url,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GOOGLE_API_KEY,
                    "X-Goog-FieldMask":
                        "places.id," +
                        "places.displayName," +
                        "places.location," +
                        "places.formattedAddress," +
                        "places.rating," +
                        "places.userRatingCount"
                },

                body: JSON.stringify(datosBusqueda)
            }
        );

        const datos = await respuesta.json();

        console.log(
            "🔎 PRUEBA LUPITA:",
            datos
        );

    } catch (error) {

        console.error(
            "Error buscando Lupita:",
            error
        );
    }
}

probarBusquedaLupita();