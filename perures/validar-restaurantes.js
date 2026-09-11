// ======================================================
// VALIDADOR DEL CATÁLOGO DE PERURES
// ======================================================
//
// Funciones principales:
//
// - Clasificar restaurantes automáticamente.
// - Recuperar decisiones guardadas en Firebase.
// - Aprobar restaurantes.
// - Descartar restaurantes.
// - Actualizar / sustituir fichas.
// - Buscar dentro de la vista actual del catálogo.
// - Actualizar contadores en tiempo real.
// - Desintegrar visualmente una tarjeta al aprobar
//   o descartar.
//
// ======================================================


// ======================================================
// 1. PALABRAS CLAVE
// ======================================================

const palabrasPeruanas = [
    "peru",
    "perú",
    "peruano",
    "peruana",
    "ceviche",
    "cevicheria",
    "cevichería",
    "chifa",
    "nikkei",
    "pisco",
    "cusco",
    "cuzco",
    "inca",
    "lima",
    "arequipa",
    "arequepay",
    "criollo",
    "anticucho",
    "anticuchos",
    "pollo a la brasa",
    "polleria",
    "pollería"
];


const palabrasSospechosas = [
    "italiano",
    "italiana",
    "pizza",
    "burger",
    "hamburguesa",
    "kebab",
    "turco",
    "mexicano",
    "mexicana",
    "chino",
    "china",
    "indio",
    "india"
];


// ======================================================
// 2. UTILIDADES DE TEXTO
// ======================================================

function normalizarTexto(texto) {

    if (!texto) {
        return "";
    }


    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();
}


function contieneAlgunaPalabra(
    texto,
    palabras
) {

    const textoNormalizado =
        normalizarTexto(
            texto
        );


    return palabras.some(
        function (palabra) {

            return textoNormalizado.includes(
                normalizarTexto(
                    palabra
                )
            );
        }
    );
}


// ======================================================
// 3. CLASIFICADOR AUTOMÁTICO
// ======================================================

function clasificarRestaurante(
    restaurante
) {

    const nombre =
        restaurante.displayName?.text ||
        "";


    const direccion =
        restaurante.formattedAddress ||
        "";


    const textoCompleto =
        nombre +
        " " +
        direccion;


    // ------------------------------------------
    // Señales claramente peruanas.
    // ------------------------------------------

    if (
        contieneAlgunaPalabra(
            textoCompleto,
            palabrasPeruanas
        )
    ) {

        return "VALIDADO";
    }


    // ------------------------------------------
    // Señales de otra gastronomía.
    // ------------------------------------------

    if (
        contieneAlgunaPalabra(
            textoCompleto,
            palabrasSospechosas
        )
    ) {

        return "DESCARTADO";
    }


    // ------------------------------------------
    // No tenemos suficientes datos.
    // ------------------------------------------

    return "REVISAR";
}


// ======================================================
// 4. FIREBASE
// ======================================================

const dbPeruRes =
    firebase.database();


// ======================================================
// 5. OBTENER DECISIONES GUARDADAS
// ======================================================

async function obtenerDecisionesGuardadas() {

    try {

        const snapshot =
            await dbPeruRes
                .ref(
                    "perures/decisiones"
                )
                .once(
                    "value"
                );


        if (!snapshot.exists()) {
            return {};
        }


        return (
            snapshot.val() ||
            {}
        );

    } catch (error) {

        console.error(
            "Error leyendo decisiones de Firebase:",
            error
        );


        return {};
    }
}


// ======================================================
// 6. GUARDAR DECISIÓN MANUAL
// ======================================================

async function guardarDecision(
    id,
    estado
) {

    try {

        /*
         * Usamos update() y no set().
         *
         * Así, si una ficha ya tenía datosActualizados
         * por una corrección manual, cambiarla entre
         * VALIDADO / REVISAR / DESCARTADO no borra
         * esos datos corregidos.
         */
        await dbPeruRes
            .ref(
                "perures/decisiones/" +
                id
            )
            .update({

                estado:
                    estado,

                tipo:
                    "DECISION_MANUAL",

                fechaRevision:
                    new Date()
                        .toISOString()
            });


        console.log(
            "Decisión guardada:",
            id,
            estado
        );


        return true;

    } catch (error) {

        console.error(
            "Error guardando decisión:",
            error
        );


        return false;
    }
}


// ======================================================
// 7. GUARDAR ACTUALIZACIÓN DE UNA FICHA
// ======================================================

async function guardarActualizacion(
    idOriginal,
    datosActualizados
) {

    try {

        await dbPeruRes
            .ref(
                "perures/decisiones/" +
                idOriginal
            )
            .set({

                /*
                 * Una ficha actualizada por el
                 * administrador queda validada.
                 */
                estado:
                    "VALIDADO",

                tipo:
                    "ACTUALIZADO",

                fechaRevision:
                    new Date()
                        .toISOString(),

                datosActualizados: {

                    id:
                        datosActualizados.id,

                    nombre:
                        datosActualizados.nombre,

                    direccion:
                        datosActualizados.direccion,

                    latitud:
                        datosActualizados.latitud,

                    longitud:
                        datosActualizados.longitud,

                    rating:
                        datosActualizados.rating,

                    resenas:
                        datosActualizados.resenas
                }
            });


        console.log(
            "Ficha actualizada:",
            idOriginal,
            datosActualizados
        );


        return true;

    } catch (error) {

        console.error(
            "Error actualizando ficha:",
            error
        );


        return false;
    }
}


// ======================================================
// 8. VALIDAR CATÁLOGO COMPLETO
// ======================================================

async function validarCatalogo() {

    try {

        // ------------------------------------------
        // Leemos el catálogo descubierto.
        // ------------------------------------------

        let restaurantes;


        /*
         * Si en esta sesión acabamos de ejecutar
         * "Actualizar catálogo", usamos directamente
         * el catálogo recién rastreado.
         *
         * Así Validar catálogo siempre trabaja sobre
         * la versión más reciente y no sobre un JSON
         * anterior que pueda contener más registros.
         */
        if (
            Array.isArray(
                window.catalogoPeruRes
            ) &&
            window.catalogoPeruRes.length > 0
        ) {

            restaurantes =
                window.catalogoPeruRes;


            console.log(
                "📦 Validando catálogo recién actualizado:",
                restaurantes.length
            );

        } else {

            /*
             * Si todavía no se ha actualizado el catálogo
             * durante esta sesión, usamos restaurantes.json
             * como respaldo.
             */
            const respuesta =
                await fetch(
                    "restaurantes.json"
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No se pudo leer restaurantes.json"
                );
            }


            restaurantes =
                await respuesta.json();


            console.log(
                "📄 Validando catálogo guardado:",
                restaurantes.length
            );
        }


        // ------------------------------------------
        // Leemos nuestras decisiones manuales.
        // ------------------------------------------

        const decisionesGuardadas =
            await obtenerDecisionesGuardadas();


        const validados = [];
        const revisar = [];
        const descartados = [];


        // ------------------------------------------
        // Procesamos cada restaurante.
        // ------------------------------------------

        restaurantes.forEach(
            function (restaurante) {

                const decision =
                    decisionesGuardadas[
                        restaurante.id
                    ] ||
                    null;


                let estado;


                // ==================================
                // DECISIÓN GUARDADA
                // ==================================

                if (
                    decision &&
                    decision.estado
                ) {

                    estado =
                        decision.estado;

                } else {

                    estado =
                        clasificarRestaurante(
                            restaurante
                        );
                }


                // ==================================
                // DATOS MODIFICADOS MANUALMENTE
                // ==================================

                const datosActualizados =
                    decision
                        ?.datosActualizados ||
                    {};


                // ==================================
                // OBJETO NORMALIZADO PERURES
                // ==================================

                const restaurantePeruRes = {

                    id:
                        datosActualizados.id ||
                        restaurante.id,


                    nombre:
                        datosActualizados.nombre ??
                        restaurante
                            .displayName
                            ?.text ??
                        "",


                    direccion:
                        datosActualizados.direccion ??
                        restaurante
                            .formattedAddress ??
                        "",


                    latitud:
                        datosActualizados.latitud ??
                        restaurante
                            .location
                            ?.latitude ??
                        null,


                    longitud:
                        datosActualizados.longitud ??
                        restaurante
                            .location
                            ?.longitude ??
                        null,


                    rating:
                        datosActualizados.rating ??
                        restaurante.rating ??
                        0,


                    resenas:
                        datosActualizados.resenas ??
                        restaurante
                            .userRatingCount ??
                        0,


                    estadoValidacion:
                        estado,


                    /*
                     * Conservamos siempre el ID con
                     * el que apareció originalmente.
                     */
                    idOriginal:
                        restaurante.id
                };


                // ==================================
                // DISTRIBUIR POR ESTADO
                // ==================================

                if (
                    estado ===
                    "VALIDADO"
                ) {

                    validados.push(
                        restaurantePeruRes
                    );

                } else if (
                    estado ===
                    "DESCARTADO"
                ) {

                    descartados.push(
                        restaurantePeruRes
                    );

                } else {

                    revisar.push(
                        restaurantePeruRes
                    );
                }
            }
        );


        // ------------------------------------------
        // Variables globales utilizadas por admin.
        // ------------------------------------------

        window.restaurantesValidados =
            validados;


        window.restaurantesRevisar =
            revisar;


        window.restaurantesDescartados =
            descartados;


        // ------------------------------------------
        // Consola.
        // ------------------------------------------

        console.log(
            "======================================"
        );

        console.log(
            "🇵🇪 VALIDACIÓN PERURES"
        );

        console.log(
            "======================================"
        );

        console.log(
            "🟢 Validados:",
            validados.length
        );

        console.log(
            "🟡 Revisar:",
            revisar.length
        );

        console.log(
            "🔴 Descartados:",
            descartados.length
        );


        // ------------------------------------------
        // Actualizamos el gestor visual completo.
        // ------------------------------------------

        inicializarGestorCatalogo();

        mostrarVistaCatalogo();

        actualizarResumenValidacion();


        return {

            validados,
            revisar,
            descartados
        };

    } catch (error) {

        console.error(
            "Error validando catálogo:",
            error
        );


        return {

            validados: [],
            revisar: [],
            descartados: []
        };
    }
}


// ======================================================
// 9. EXPONER VALIDADOR AL ADMIN.HTML
// ======================================================

window.validarCatalogo =
    validarCatalogo;


// ======================================================
// 10. GESTOR VISUAL DEL CATÁLOGO
// ======================================================

/*
 * Controla qué grupo estamos viendo:
 *
 * - todos
 * - validados
 * - revisar
 * - descartados
 */
let vistaCatalogoActual =
    "todos";


// ======================================================
// 11. INICIALIZAR PESTAÑAS
// ======================================================

function inicializarGestorCatalogo() {

    const seccion =
        document.getElementById(
            "revision-catalogo"
        );


    if (!seccion) {
        return;
    }


    const titulo =
        seccion.querySelector(
            "h2"
        );


    if (titulo) {

        titulo.textContent =
            "Catálogo de restaurantes";
    }


    /*
     * Si las pestañas ya existen, no las duplicamos.
     */
    if (
        seccion.querySelector(
            ".catalogo-tabs"
        )
    ) {

        actualizarContadoresCatalogo();

        return;
    }


    const tabs =
        document.createElement(
            "div"
        );


    tabs.className =
        "catalogo-tabs";


    tabs.setAttribute(
        "role",
        "tablist"
    );


    const configuracion = [

        {
            vista:
                "todos",

            texto:
                "Todos",

            contador:
                "contador-todos"
        },

        {
            vista:
                "validados",

            texto:
                "✅ Validados",

            contador:
                "contador-validados"
        },

        {
            vista:
                "revisar",

            texto:
                "🟡 Pendientes",

            contador:
                "contador-pendientes"
        },

        {
            vista:
                "descartados",

            texto:
                "❌ Descartados",

            contador:
                "contador-descartados"
        }
    ];


    configuracion.forEach(
        function (item) {

            const boton =
                document.createElement(
                    "button"
                );


            boton.type =
                "button";


            boton.className =
                "tab-catalogo";


            boton.dataset.vista =
                item.vista;


            boton.setAttribute(
                "role",
                "tab"
            );


            const texto =
                document.createElement(
                    "span"
                );


            texto.textContent =
                item.texto;


            const contador =
                document.createElement(
                    "span"
                );


            contador.id =
                item.contador;


            contador.className =
                "tab-contador";


            contador.textContent =
                "0";


            boton.appendChild(
                texto
            );


            boton.appendChild(
                contador
            );


            tabs.appendChild(
                boton
            );
        }
    );


    if (titulo) {

        titulo.insertAdjacentElement(
            "afterend",
            tabs
        );

    } else {

        seccion.prepend(
            tabs
        );
    }


    actualizarPestanaActiva();

    actualizarContadoresCatalogo();
}


// ======================================================
// 12. OBTENER RESTAURANTES DE LA VISTA ACTUAL
// ======================================================

function obtenerRestaurantesVista(
    vista
) {

    const validados =
        window.restaurantesValidados ||
        [];


    const revisar =
        window.restaurantesRevisar ||
        [];


    const descartados =
        window.restaurantesDescartados ||
        [];


    if (
        vista ===
        "validados"
    ) {

        return [
            ...validados
        ];
    }


    if (
        vista ===
        "revisar"
    ) {

        return [
            ...revisar
        ];
    }


    if (
        vista ===
        "descartados"
    ) {

        return [
            ...descartados
        ];
    }


    return [
        ...validados,
        ...revisar,
        ...descartados
    ];
}


// ======================================================
// 13. ACTUALIZAR CONTADORES DE PESTAÑAS
// ======================================================

function actualizarContadoresCatalogo() {

    const validados =
        window.restaurantesValidados ||
        [];


    const revisar =
        window.restaurantesRevisar ||
        [];


    const descartados =
        window.restaurantesDescartados ||
        [];


    const total =
        validados.length +
        revisar.length +
        descartados.length;


    const contadorTodos =
        document.getElementById(
            "contador-todos"
        );


    const contadorValidados =
        document.getElementById(
            "contador-validados"
        );


    const contadorPendientes =
        document.getElementById(
            "contador-pendientes"
        );


    const contadorDescartados =
        document.getElementById(
            "contador-descartados"
        );


    if (contadorTodos) {

        contadorTodos.textContent =
            total;
    }


    if (contadorValidados) {

        contadorValidados.textContent =
            validados.length;
    }


    if (contadorPendientes) {

        contadorPendientes.textContent =
            revisar.length;
    }


    if (contadorDescartados) {

        contadorDescartados.textContent =
            descartados.length;
    }
}


// ======================================================
// 14. MARCAR PESTAÑA ACTIVA
// ======================================================

function actualizarPestanaActiva() {

    const botones =
        document.querySelectorAll(
            ".tab-catalogo"
        );


    botones.forEach(
        function (boton) {

            const activa =
                boton.dataset.vista ===
                vistaCatalogoActual;


            boton.classList.toggle(
                "activa",
                activa
            );


            boton.setAttribute(
                "aria-selected",
                activa
                    ? "true"
                    : "false"
            );
        }
    );
}


// ======================================================
// 15. FILTRAR LA VISTA CON EL BUSCADOR
// ======================================================

function filtrarRestaurantesVista(
    restaurantes
) {

    const buscador =
        document.getElementById(
            "buscar-revision"
        );


    if (!buscador) {

        return restaurantes;
    }


    const consulta =
        normalizarTexto(
            buscador.value
        );


    if (!consulta) {

        return restaurantes;
    }


    return restaurantes.filter(
        function (restaurante) {

            const texto =
                normalizarTexto(
                    [
                        restaurante.nombre,
                        restaurante.direccion
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " "
                        )
                );


            return texto.includes(
                consulta
            );
        }
    );
}


// ======================================================
// 16. MOSTRAR VISTA DEL CATÁLOGO
// ======================================================

function mostrarVistaCatalogo() {

    inicializarGestorCatalogo();


    const lista =
        document.getElementById(
            "lista-revision"
        );


    const contador =
        document.getElementById(
            "contador-revision"
        );


    if (
        !lista ||
        !contador
    ) {

        return;
    }


    actualizarPestanaActiva();

    actualizarContadoresCatalogo();


    const restaurantesVista =
        obtenerRestaurantesVista(
            vistaCatalogoActual
        );


    const restaurantesFiltrados =
        filtrarRestaurantesVista(
            restaurantesVista
        );


    lista.innerHTML =
        "";


    restaurantesFiltrados.forEach(
        function (restaurante) {

            lista.appendChild(
                crearTarjetaRevision(
                    restaurante
                )
            );
        }
    );


    const buscador =
        document.getElementById(
            "buscar-revision"
        );


    const buscando =
        Boolean(
            buscador &&
            buscador.value.trim()
        );


    if (buscando) {

        contador.textContent =
            restaurantesFiltrados.length +
            " restaurantes coinciden con la búsqueda.";

        return;
    }


    if (
        vistaCatalogoActual ===
        "validados"
    ) {

        contador.textContent =
            restaurantesFiltrados.length +
            " restaurantes validados.";

        return;
    }


    if (
        vistaCatalogoActual ===
        "revisar"
    ) {

        contador.textContent =
            restaurantesFiltrados.length +
            " restaurantes pendientes de revisión.";

        return;
    }


    if (
        vistaCatalogoActual ===
        "descartados"
    ) {

        contador.textContent =
            restaurantesFiltrados.length +
            " restaurantes descartados.";

        return;
    }


    contador.textContent =
        restaurantesFiltrados.length +
        " restaurantes en el catálogo.";
}


// ======================================================
// 17. COMPATIBILIDAD CON LA FUNCIÓN ANTERIOR
// ======================================================

function mostrarRestaurantesParaRevision(
    restaurantes
) {

    /*
     * Conservamos esta función porque formaba parte
     * de la versión anterior del validador.
     *
     * Si alguna parte antigua la llama, mostramos
     * directamente los pendientes sin romper nada.
     */

    const listaRevision =
        document.getElementById(
            "lista-revision"
        );


    const contadorRevision =
        document.getElementById(
            "contador-revision"
        );


    if (
        !listaRevision ||
        !contadorRevision
    ) {

        return;
    }


    listaRevision.innerHTML =
        "";


    contadorRevision.textContent =
        restaurantes.length +
        " restaurantes pendientes de revisión.";


    restaurantes.forEach(
        function (restaurante) {

            listaRevision.appendChild(
                crearTarjetaRevision(
                    restaurante
                )
            );
        }
    );
}


// ======================================================
// 18. CREAR TARJETA
// ======================================================

function crearTarjetaRevision(
    restaurante
) {

    const id =
        restaurante.idOriginal ||
        restaurante.id;


    const estadoActual =
        restaurante.estadoValidacion ||
        "REVISAR";


    const tarjeta =
        document.createElement(
            "div"
        );


    tarjeta.className =
        "tarjeta-revision";


    tarjeta.dataset.id =
        id;


    tarjeta.dataset.estado =
        estadoActual;


    // ==================================================
    // NOMBRE
    // ==================================================

    const nombre =
        document.createElement(
            "h3"
        );


    nombre.textContent =
        restaurante.nombre ||
        "Sin nombre";


    // ==================================================
    // DIRECCIÓN
    // ==================================================

    const direccion =
        document.createElement(
            "p"
        );


    direccion.textContent =
        restaurante.direccion ||
        "Dirección no disponible";


    // ==================================================
    // VALORACIÓN
    // ==================================================

    const valoracion =
        document.createElement(
            "p"
        );


    valoracion.textContent =
        "⭐ " +
        restaurante.rating +
        " · " +
        restaurante.resenas +
        " reseñas";


    // ==================================================
    // ESTADO
    // ==================================================

    const estado =
        document.createElement(
            "span"
        );


    estado.className =
        "estado-restaurante";


    if (
        estadoActual ===
        "VALIDADO"
    ) {

        estado.classList.add(
            "estado-validado"
        );


        estado.textContent =
            "✅ VALIDADO";

    } else if (
        estadoActual ===
        "DESCARTADO"
    ) {

        estado.classList.add(
            "estado-descartado"
        );


        estado.textContent =
            "❌ DESCARTADO";

    } else {

        estado.classList.add(
            "estado-pendiente"
        );


        estado.textContent =
            "🟡 PENDIENTE";
    }


    tarjeta.appendChild(
        nombre
    );


    tarjeta.appendChild(
        direccion
    );


    tarjeta.appendChild(
        valoracion
    );


    tarjeta.appendChild(
        estado
    );


    // ==================================================
    // ACCIONES SEGÚN EL ESTADO ACTUAL
    // ==================================================

    /*
     * PENDIENTE:
     * - Aprobar
     * - Actualizar
     * - Descartar
     *
     * VALIDADO:
     * - Actualizar
     * - Pasar a pendiente
     * - Descartar
     *
     * DESCARTADO:
     * - Pasar a pendiente
     * - Validar
     */

    function crearBotonAccion(
        clase,
        texto
    ) {

        const boton =
            document.createElement(
                "button"
            );


        boton.type =
            "button";


        boton.className =
            clase;


        boton.dataset.id =
            id;


        boton.textContent =
            texto;


        return boton;
    }


    if (
        estadoActual ===
        "REVISAR"
    ) {

        tarjeta.appendChild(
            crearBotonAccion(
                "btn-aprobar",
                "✅ Aprobar"
            )
        );


        tarjeta.appendChild(
            crearBotonAccion(
                "btn-actualizar",
                "✏️ Actualizar"
            )
        );


        tarjeta.appendChild(
            crearBotonAccion(
                "btn-descartar",
                "❌ Descartar"
            )
        );

    } else if (
        estadoActual ===
        "VALIDADO"
    ) {

        tarjeta.appendChild(
            crearBotonAccion(
                "btn-actualizar",
                "✏️ Actualizar"
            )
        );


        tarjeta.appendChild(
            crearBotonAccion(
                "btn-pendiente",
                "↩️ Pendiente"
            )
        );


        tarjeta.appendChild(
            crearBotonAccion(
                "btn-descartar",
                "❌ Descartar"
            )
        );

    } else if (
        estadoActual ===
        "DESCARTADO"
    ) {

        tarjeta.appendChild(
            crearBotonAccion(
                "btn-pendiente",
                "↩️ Pendiente"
            )
        );


        tarjeta.appendChild(
            crearBotonAccion(
                "btn-aprobar",
                "✅ Validar"
            )
        );
    }


    return tarjeta;
}


// ======================================================
// 19. ACTUALIZAR CONTADOR / VISTA
// ======================================================

function actualizarContadorRevision() {

    actualizarContadoresCatalogo();

    mostrarVistaCatalogo();
}


// ======================================================
// 13. ACTUALIZAR RESUMEN GENERAL
// ======================================================

function actualizarResumenValidacion() {

    const estadoActualizacion =
        document.getElementById(
            "estado-actualizacion"
        );


    if (!estadoActualizacion) {
        return;
    }


    const validados =
        window.restaurantesValidados ||
        [];


    const revisar =
        window.restaurantesRevisar ||
        [];


    const descartados =
        window.restaurantesDescartados ||
        [];


    estadoActualizacion.textContent =
        "Validación terminada | " +
        "Validados: " +
        validados.length +
        " | Revisar: " +
        revisar.length +
        " | Descartados: " +
        descartados.length;
}


// ======================================================
// 14. MOVER RESTAURANTE TRAS DECISIÓN
// ======================================================

function moverRestauranteTrasDecision(
    id,
    nuevoEstado
) {

    const grupos = [
        window.restaurantesValidados ||
        [],

        window.restaurantesRevisar ||
        [],

        window.restaurantesDescartados ||
        []
    ];


    let restaurante =
        null;


    /*
     * El restaurante puede venir ahora de cualquiera
     * de los tres estados.
     */
    for (
        const grupo of grupos
    ) {

        const indice =
            grupo.findIndex(
                function (item) {

                    return (
                        item.idOriginal === id ||
                        item.id === id
                    );
                }
            );


        if (
            indice !== -1
        ) {

            restaurante =
                grupo.splice(
                    indice,
                    1
                )[0];


            break;
        }
    }


    if (!restaurante) {

        console.error(
            "No se encontró restaurante para mover:",
            id,
            nuevoEstado
        );


        return false;
    }


    if (
        nuevoEstado ===
        "VALIDADO"
    ) {

        restaurante.estadoValidacion =
            "VALIDADO";


        window
            .restaurantesValidados
            .push(
                restaurante
            );

    } else if (
        nuevoEstado ===
        "DESCARTADO"
    ) {

        restaurante.estadoValidacion =
            "DESCARTADO";


        window
            .restaurantesDescartados
            .push(
                restaurante
            );

    } else {

        /*
         * El estado visual PENDIENTE se guarda
         * internamente como REVISAR.
         */
        restaurante.estadoValidacion =
            "REVISAR";


        window
            .restaurantesRevisar
            .push(
                restaurante
            );
    }


    actualizarResumenValidacion();

    return true;
}


// ======================================================
// 15. MOVER RESTAURANTE ACTUALIZADO
// ======================================================

function moverRestauranteActualizado(
    idOriginal,
    datosActualizados
) {

    const grupos = [
        window.restaurantesValidados ||
        [],

        window.restaurantesRevisar ||
        [],

        window.restaurantesDescartados ||
        []
    ];


    let restauranteOriginal =
        null;


    /*
     * Actualizar puede ejecutarse desde Pendientes
     * o desde Validados.
     */
    for (
        const grupo of grupos
    ) {

        const indice =
            grupo.findIndex(
                function (restaurante) {

                    return (
                        restaurante.idOriginal ===
                        idOriginal ||
                        restaurante.id ===
                        idOriginal
                    );
                }
            );


        if (
            indice !== -1
        ) {

            restauranteOriginal =
                grupo.splice(
                    indice,
                    1
                )[0];


            break;
        }
    }


    if (!restauranteOriginal) {

        console.error(
            "No se encontró restaurante actualizado:",
            idOriginal
        );


        return false;
    }


    const restauranteActualizado = {

        ...restauranteOriginal,

        ...datosActualizados,

        id:
            datosActualizados.id ||
            restauranteOriginal.id,

        idOriginal:
            idOriginal,

        estadoValidacion:
            "VALIDADO"
    };


    window
        .restaurantesValidados
        .push(
            restauranteActualizado
        );


    actualizarResumenValidacion();

    return true;
}


// ======================================================
// 16. MODAL DE ACTUALIZACIÓN
// ======================================================

function abrirModalActualizacion(
    restaurante
) {

    // ------------------------------------------
    // Eliminamos otro modal si estuviera abierto.
    // ------------------------------------------

    const anterior =
        document.getElementById(
            "modal-actualizar-restaurante"
        );


    if (anterior) {
        anterior.remove();
    }


    // ==================================================
    // OVERLAY
    // ==================================================

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "modal-actualizar-restaurante";


    modal.className =
        "modal-overlay";


    // ==================================================
    // CONTENIDO
    // ==================================================

    const contenido =
        document.createElement(
            "div"
        );


    contenido.className =
        "modal-contenido";


    // ==================================================
    // TÍTULO
    // ==================================================

    const titulo =
        document.createElement(
            "h2"
        );


    titulo.textContent =
        "✏️ Actualizar restaurante";


    const descripcion =
        document.createElement(
            "p"
        );


    descripcion.textContent =
        restaurante.estadoValidacion === "VALIDADO"
            ? "Corrige los datos de esta ficha validada. Al guardar, seguirá validada."
            : "Corrige la ficha. Al guardar, el restaurante quedará validado.";


    // ==================================================
    // CAMPOS
    // ==================================================

    const campoNombre =
        crearCampoModal(
            "Nombre del restaurante",
            "text",
            restaurante.nombre || "",
            "Ej: Bar Delicia de Chiclayo"
        );


    const campoDireccion =
        crearCampoModal(
            "Dirección",
            "text",
            restaurante.direccion || "",
            "Dirección del restaurante"
        );


    const campoId =
        crearCampoModal(
            "Place ID",
            "text",
            restaurante.id || "",
            "Place ID de Google"
        );


    const campoLatitud =
        crearCampoModal(
            "Latitud",
            "number",
            restaurante.latitud ?? "",
            ""
        );


    campoLatitud.input.step =
        "any";


    const campoLongitud =
        crearCampoModal(
            "Longitud",
            "number",
            restaurante.longitud ?? "",
            ""
        );


    campoLongitud.input.step =
        "any";


    const campoRating =
        crearCampoModal(
            "Valoración",
            "number",
            restaurante.rating ?? 0,
            ""
        );


    campoRating.input.min =
        "0";


    campoRating.input.max =
        "5";


    campoRating.input.step =
        "0.1";


    const campoResenas =
        crearCampoModal(
            "Número de reseñas",
            "number",
            restaurante.resenas ?? 0,
            ""
        );


    campoResenas.input.min =
        "0";


    // ==================================================
    // ACCIONES
    // ==================================================

    const acciones =
        document.createElement(
            "div"
        );


    acciones.className =
        "modal-acciones";


    const botonCancelar =
        document.createElement(
            "button"
        );


    botonCancelar.type =
        "button";


    botonCancelar.className =
        "btn-modal-cancelar";


    botonCancelar.textContent =
        "Cancelar";


    const botonGuardar =
        document.createElement(
            "button"
        );


    botonGuardar.type =
        "button";


    botonGuardar.className =
        "btn-modal-guardar";


    botonGuardar.textContent =
        "✅ Guardar cambios";


    // ==================================================
    // MONTAR MODAL
    // ==================================================

    contenido.appendChild(
        titulo
    );


    contenido.appendChild(
        descripcion
    );


    agregarCampoAlModal(
        contenido,
        campoNombre
    );


    agregarCampoAlModal(
        contenido,
        campoDireccion
    );


    agregarCampoAlModal(
        contenido,
        campoId
    );


    agregarCampoAlModal(
        contenido,
        campoLatitud
    );


    agregarCampoAlModal(
        contenido,
        campoLongitud
    );


    agregarCampoAlModal(
        contenido,
        campoRating
    );


    agregarCampoAlModal(
        contenido,
        campoResenas
    );


    acciones.appendChild(
        botonCancelar
    );


    acciones.appendChild(
        botonGuardar
    );


    contenido.appendChild(
        acciones
    );


    modal.appendChild(
        contenido
    );


    document.body.appendChild(
        modal
    );


    // ------------------------------------------
    // Focus inicial.
    // ------------------------------------------

    campoNombre.input.focus();


    campoNombre.input.select();


    // ==================================================
    // CANCELAR
    // ==================================================

    botonCancelar.addEventListener(
        "click",
        function () {

            modal.remove();
        }
    );


    // ==================================================
    // CERRAR AL HACER CLIC FUERA
    // ==================================================

    modal.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target ===
                modal
            ) {

                modal.remove();
            }
        }
    );


    // ==================================================
    // GUARDAR CAMBIOS
    // ==================================================

    botonGuardar.addEventListener(
        "click",
        async function () {

            const nombre =
                campoNombre
                    .input
                    .value
                    .trim();


            const direccion =
                campoDireccion
                    .input
                    .value
                    .trim();


            const nuevoId =
                campoId
                    .input
                    .value
                    .trim();


            // ------------------------------------------
            // Validación.
            // ------------------------------------------

            if (!nombre) {

                alert(
                    "Debes indicar el nombre del restaurante."
                );


                campoNombre
                    .input
                    .focus();


                return;
            }


            if (!direccion) {

                alert(
                    "Debes indicar la dirección."
                );


                campoDireccion
                    .input
                    .focus();


                return;
            }


            botonGuardar.disabled =
                true;


            botonGuardar.textContent =
                "Guardando...";


            const datosActualizados = {

                id:
                    nuevoId ||
                    restaurante.id,

                nombre:
                    nombre,

                direccion:
                    direccion,

                latitud:
                    convertirNumeroONull(
                        campoLatitud
                            .input
                            .value
                    ),

                longitud:
                    convertirNumeroONull(
                        campoLongitud
                            .input
                            .value
                    ),

                rating:
                    convertirNumero(
                        campoRating
                            .input
                            .value,
                        0
                    ),

                resenas:
                    convertirNumero(
                        campoResenas
                            .input
                            .value,
                        0
                    )
            };


            const idOriginal =
                restaurante.idOriginal ||
                restaurante.id;


            const guardado =
                await guardarActualizacion(
                    idOriginal,
                    datosActualizados
                );


            if (!guardado) {

                botonGuardar.disabled =
                    false;


                botonGuardar.textContent =
                    "✅ Guardar cambios";


                alert(
                    "No se pudo guardar la actualización."
                );


                return;
            }


            const tarjeta =
                document.querySelector(
                    `.tarjeta-revision[data-id="${CSS.escape(idOriginal)}"]`
                );


            moverRestauranteActualizado(
                idOriginal,
                datosActualizados
            );


            /*
             * La ficha ya se movió a Validados.
             * Refrescamos la vista actual para que:
             *
             * - desaparezca de Pendientes;
             * - permanezca visible en Todos como VALIDADO;
             * - aparezca en Validados.
             */
            if (tarjeta) {

                tarjeta.remove();
            }


            actualizarContadorRevision();


            modal.remove();


            console.log(
                "✅ Restaurante actualizado:",
                datosActualizados
            );
        }
    );
}


// ======================================================
// 17. CREAR CAMPO DE MODAL
// ======================================================

function crearCampoModal(
    textoLabel,
    tipo,
    valor,
    placeholder
) {

    const label =
        document.createElement(
            "label"
        );


    label.textContent =
        textoLabel;


    const input =
        document.createElement(
            "input"
        );


    input.type =
        tipo;


    input.value =
        valor;


    input.placeholder =
        placeholder;


    return {
        label,
        input
    };
}


function agregarCampoAlModal(
    contenedor,
    campo
) {

    contenedor.appendChild(
        campo.label
    );


    contenedor.appendChild(
        campo.input
    );
}


// ======================================================
// 18. CONVERSIÓN DE NÚMEROS
// ======================================================

function convertirNumeroONull(
    valor
) {

    if (
        valor === "" ||
        valor === null ||
        valor === undefined
    ) {

        return null;
    }


    const numero =
        Number(
            valor
        );


    return Number.isFinite(
        numero
    )
        ? numero
        : null;
}


function convertirNumero(
    valor,
    valorDefecto = 0
) {

    const numero =
        Number(
            valor
        );


    return Number.isFinite(
        numero
    )
        ? numero
        : valorDefecto;
}

// ======================================================
// 19. PREPARAR CAPTURA PARA LA DESINTEGRACIÓN
// ======================================================

async function prepararCapturaTarjeta(
    tarjeta
) {

    if (!tarjeta) {
        return null;
    }


    if (
        typeof html2canvas ===
        "undefined"
    ) {

        console.warn(
            "html2canvas no está disponible."
        );


        return null;
    }


    try {

        /*
         * scale 1 mantiene suficiente calidad
         * para el efecto y reduce el tiempo
         * de preparación.
         */
        return await html2canvas(
            tarjeta,
            {
                backgroundColor:
                    null,

                scale:
                    1,

                logging:
                    false,

                useCORS:
                    true
            }
        );

    } catch (error) {

        console.error(
            "Error capturando tarjeta:",
            error
        );


        return null;
    }
}


// ======================================================
// 20. CONFIGURACIÓN DEL EFECTO DE DESINTEGRACIÓN
// ======================================================

/*
 * Inspirado en la mecánica visual del ejemplo:
 *
 * - muchas capas
 * - píxeles distribuidos progresivamente
 * - cada píxel aparece en más de una capa
 * - retardos escalonados
 */

const REPETICIONES_PIXEL =
    2;


const NUM_FRAMES_DESINTEGRACION =
    128;


const DURACION_FRAME_MS =
    1000;


const RETRASO_TOTAL_MS =
    1350;


// ======================================================
// 21. GENERAR FRAMES DE PÍXELES
// ======================================================

function generarFramesDesintegracion(
    canvas,
    cantidad =
        NUM_FRAMES_DESINTEGRACION
) {

    const ancho =
        canvas.width;


    const alto =
        canvas.height;


    const contexto =
        canvas.getContext(
            "2d",
            {
                willReadFrequently:
                    true
            }
        );


    const original =
        contexto.getImageData(
            0,
            0,
            ancho,
            alto
        );


    /*
     * Creamos imágenes transparentes.
     * Cada una será una capa del efecto.
     */
    const imagenes =
        Array.from(
            {
                length:
                    cantidad
            },
            function () {

                return contexto.createImageData(
                    ancho,
                    alto
                );
            }
        );


    // ==================================================
    // REPARTIR PÍXELES ENTRE LOS FRAMES
    // ==================================================

    /*
     * Recorremos primero X para que la posición
     * horizontal controle el avance del efecto.
     */
    for (
        let x = 0;
        x < ancho;
        x++
    ) {

        for (
            let y = 0;
            y < alto;
            y++
        ) {

            const indicePixel =
                (
                    y *
                    ancho +
                    x
                ) *
                4;


            const alpha =
                original.data[
                    indicePixel + 3
                ];


            // Ignoramos píxeles transparentes.
            if (alpha === 0) {
                continue;
            }


            /*
             * Copiamos cada píxel en más de una capa.
             *
             * Esto evita que el efecto se vea demasiado
             * fino o vacío y crea el polvo denso.
             */
            for (
                let repeticion = 0;
                repeticion <
                REPETICIONES_PIXEL;
                repeticion++
            ) {

                /*
                 * La fórmula hace que los píxeles
                 * de la izquierda tiendan a caer
                 * en frames anteriores y los de
                 * la derecha en frames posteriores.
                 *
                 * Math.random() rompe la frontera
                 * para conseguir una desintegración
                 * orgánica.
                 */
                const indiceFrame =
                    Math.floor(
                        cantidad *
                        (
                            Math.random() +
                            2 *
                            x /
                            Math.max(
                                ancho,
                                1
                            )
                        ) /
                        3
                    );


                const frameSeguro =
                    Math.max(
                        0,
                        Math.min(
                            cantidad - 1,
                            indiceFrame
                        )
                    );


                const destino =
                    imagenes[
                        frameSeguro
                    ];


                destino.data[
                    indicePixel
                ] =
                    original.data[
                        indicePixel
                    ];


                destino.data[
                    indicePixel + 1
                ] =
                    original.data[
                        indicePixel + 1
                    ];


                destino.data[
                    indicePixel + 2
                ] =
                    original.data[
                        indicePixel + 2
                    ];


                destino.data[
                    indicePixel + 3
                ] =
                    alpha;
            }
        }
    }


    // ==================================================
    // CONVERTIR LAS CAPAS A CANVAS
    // ==================================================

    return imagenes.map(
        function (
            imagen,
            indice
        ) {

            const frame =
                document.createElement(
                    "canvas"
                );


            frame.width =
                ancho;


            frame.height =
                alto;


            frame.dataset.indice =
                indice;


            const contextoFrame =
                frame.getContext(
                    "2d"
                );


            contextoFrame.putImageData(
                imagen,
                0,
                0
            );


            return frame;
        }
    );
}


// ======================================================
// 22. FALLBACK SI HTML2CANVAS NO ESTÁ DISPONIBLE
// ======================================================

async function desvanecerTarjeta(
    tarjeta
) {

    if (!tarjeta) {
        return;
    }


    const animacion =
        tarjeta.animate(
            [
                {
                    opacity:
                        1,

                    transform:
                        "scale(1)"
                },

                {
                    opacity:
                        0,

                    transform:
                        "scale(0.96)"
                }
            ],
            {
                duration:
                    450,

                easing:
                    "ease",

                fill:
                    "forwards"
            }
        );


    try {

        await animacion.finished;

    } catch (error) {

        // La tarjeta se elimina igualmente.
    }


    tarjeta.remove();
}


// ======================================================
// 23. DESINTEGRAR TARJETA
// ======================================================

async function desintegrarTarjeta(
    tarjeta,
    capturaPreparada = null
) {

    if (!tarjeta) {
        return;
    }


    // ==================================================
    // ACCESIBILIDAD
    // ==================================================

    const reducirMovimiento =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (reducirMovimiento) {

        tarjeta.remove();

        return;
    }


    // ==================================================
    // OBTENER CAPTURA
    // ==================================================

    const captura =
        capturaPreparada ||
        await prepararCapturaTarjeta(
            tarjeta
        );


    if (!captura) {

        await desvanecerTarjeta(
            tarjeta
        );


        return;
    }


    // ==================================================
    // POSICIÓN REAL DE LA TARJETA
    // ==================================================

    const rect =
        tarjeta.getBoundingClientRect();


    // ==================================================
    // CONTENEDOR DE LOS FRAMES
    // ==================================================

    const contenedor =
        document.createElement(
            "div"
        );


    contenedor.className =
        "contenedor-desintegracion";


    contenedor.style.position =
        "fixed";


    contenedor.style.left =
        rect.left +
        "px";


    contenedor.style.top =
        rect.top +
        "px";


    contenedor.style.width =
        rect.width +
        "px";


    contenedor.style.height =
        rect.height +
        "px";


    contenedor.style.pointerEvents =
        "none";


    contenedor.style.zIndex =
        "4000";


    contenedor.style.overflow =
        "visible";


    document.body.appendChild(
        contenedor
    );


    // ==================================================
    // GENERAR CAPAS
    // ==================================================

    const frames =
        generarFramesDesintegracion(
            captura
        );


    const escalaX =
        rect.width /
        captura.width;


    const escalaY =
        rect.height /
        captura.height;


    const animaciones =
        [];


    // ==================================================
    // COLOCAR Y ANIMAR CADA FRAME
    // ==================================================

    frames.forEach(
        function (
            frame,
            indice
        ) {

            frame.className =
                "frame-desintegracion";


            frame.style.position =
                "absolute";


            frame.style.left =
                "0";


            frame.style.top =
                "0";


            frame.style.width =
                captura.width *
                escalaX +
                "px";


            frame.style.height =
                captura.height *
                escalaY +
                "px";


            frame.style.pointerEvents =
                "none";


            frame.style.willChange =
                "transform, opacity";


            contenedor.appendChild(
                frame
            );


            /*
             * Retraso progresivo:
             * las primeras capas desaparecen antes
             * y las últimas después.
             */
            const retraso =
                RETRASO_TOTAL_MS *
                indice /
                frames.length;


            /*
             * Movimiento orgánico:
             * pequeño desplazamiento radial,
             * sin convertir la tarjeta en bloques.
             */
            const angulo =
                2 *
                Math.PI *
                (
                    Math.random() -
                    0.5
                );


            const moverX =
                60 *
                Math.cos(
                    angulo
                );


            const moverY =
                30 *
                Math.sin(
                    angulo
                );


            const rotacionInicial =
                15 *
                (
                    Math.random() -
                    0.5
                );


            const rotacionFinal =
                15 *
                (
                    Math.random() -
                    0.5
                );


            const animacion =
                frame.animate(
                    [
                        {
                            opacity:
                                1,

                            transform:
                                "rotate(0deg) " +
                                "translate(0, 0) " +
                                "rotate(0deg)"
                        },

                        {
                            opacity:
                                0,

                            transform:
                                `rotate(
                                    ${rotacionInicial}deg
                                )
                                translate(
                                    ${moverX}px,
                                    ${moverY}px
                                )
                                rotate(
                                    ${rotacionFinal}deg
                                )`
                        }
                    ],
                    {
                        duration:
                            DURACION_FRAME_MS,

                        delay:
                            retraso,

                        easing:
                            "ease-out",

                        fill:
                            "forwards"
                    }
                );


            animaciones.push(
                animacion
                    .finished
                    .catch(
                        function () {

                            return null;
                        }
                    )
            );
        }
    );


    /*
     * Las capas ya están exactamente encima de
     * la tarjeta original. Ahora la ocultamos.
     */
    tarjeta.style.visibility =
        "hidden";


    // ==================================================
    // ESPERAR A QUE TERMINE EL EFECTO
    // ==================================================

    await Promise.all(
        animaciones
    );


    // ==================================================
    // LIMPIEZA
    // ==================================================

    contenedor.remove();


    tarjeta.remove();
}

// ======================================================
// 24. EVENTOS: APROBAR / ACTUALIZAR / DESCARTAR
// ======================================================

document.addEventListener(
    "click",
    async function (evento) {

        // ==================================================
        // CAMBIAR PESTAÑA DEL CATÁLOGO
        // ==================================================

        const botonTab =
            evento.target.closest(
                ".tab-catalogo"
            );


        if (botonTab) {

            vistaCatalogoActual =
                botonTab.dataset.vista ||
                "todos";


            mostrarVistaCatalogo();


            return;
        }


        // ==================================================
        // APROBAR
        // ==================================================

        const botonAprobar =
            evento.target.closest(
                ".btn-aprobar"
            );


        if (botonAprobar) {

            const id =
                botonAprobar
                    .dataset
                    .id;


            const tarjeta =
                botonAprobar.closest(
                    ".tarjeta-revision"
                );


            botonAprobar.disabled =
                true;


            /*
             * La captura visual y Firebase empiezan
             * simultáneamente.
             *
             * Así eliminamos buena parte de la pausa
             * previa al efecto.
             */
            const [
                guardado,
                captura
            ] =
                await Promise.all([

                    guardarDecision(
                        id,
                        "VALIDADO"
                    ),

                    prepararCapturaTarjeta(
                        tarjeta
                    )
                ]);


            if (!guardado) {

                botonAprobar.disabled =
                    false;


                return;
            }


            moverRestauranteTrasDecision(
                id,
                "VALIDADO"
            );


            if (tarjeta) {

                await desintegrarTarjeta(
                    tarjeta,
                    captura
                );
            }


            actualizarContadorRevision();


            return;
        }


        // ==================================================
        // PASAR A PENDIENTE
        // ==================================================

        const botonPendiente =
            evento.target.closest(
                ".btn-pendiente"
            );


        if (botonPendiente) {

            const id =
                botonPendiente
                    .dataset
                    .id;


            const tarjeta =
                botonPendiente.closest(
                    ".tarjeta-revision"
                );


            botonPendiente.disabled =
                true;


            const guardado =
                await guardarDecision(
                    id,
                    "REVISAR"
                );


            if (!guardado) {

                botonPendiente.disabled =
                    false;


                return;
            }


            moverRestauranteTrasDecision(
                id,
                "REVISAR"
            );


            if (tarjeta) {

                tarjeta.remove();
            }


            actualizarContadorRevision();


            return;
        }


        // ==================================================
        // ACTUALIZAR
        // ==================================================

        const botonActualizar =
            evento.target.closest(
                ".btn-actualizar"
            );


        if (botonActualizar) {

            const id =
                botonActualizar
                    .dataset
                    .id;


            const restaurante =
                [
                    ...(
                        window
                            .restaurantesValidados ||
                        []
                    ),

                    ...(
                        window
                            .restaurantesRevisar ||
                        []
                    ),

                    ...(
                        window
                            .restaurantesDescartados ||
                        []
                    )
                ]
                    .find(
                        function (
                            restaurante
                        ) {

                            return (
                                restaurante
                                    .idOriginal ===
                                    id ||
                                restaurante
                                    .id ===
                                    id
                            );
                        }
                    );


            if (!restaurante) {

                console.error(
                    "No se encontró restaurante:",
                    id
                );


                return;
            }


            abrirModalActualizacion(
                restaurante
            );


            return;
        }


        // ==================================================
        // DESCARTAR
        // ==================================================

        const botonDescartar =
            evento.target.closest(
                ".btn-descartar"
            );


        if (botonDescartar) {

            const id =
                botonDescartar
                    .dataset
                    .id;


            const tarjeta =
                botonDescartar.closest(
                    ".tarjeta-revision"
                );


            botonDescartar.disabled =
                true;


            const [
                guardado,
                captura
            ] =
                await Promise.all([

                    guardarDecision(
                        id,
                        "DESCARTADO"
                    ),

                    prepararCapturaTarjeta(
                        tarjeta
                    )
                ]);


            if (!guardado) {

                botonDescartar.disabled =
                    false;


                return;
            }


            moverRestauranteTrasDecision(
                id,
                "DESCARTADO"
            );


            if (tarjeta) {

                await desintegrarTarjeta(
                    tarjeta,
                    captura
                );
            }


            actualizarContadorRevision();


            return;
        }
    }
);


// ======================================================
// BUSCADOR DEL CATÁLOGO
// ======================================================

const buscadorRevision =
    document.getElementById(
        "buscar-revision"
    );


if (buscadorRevision) {

    buscadorRevision.addEventListener(
        "input",
        function () {

            /*
             * El buscador filtra únicamente
             * la pestaña actualmente seleccionada.
             */
            mostrarVistaCatalogo();
        }
    );
}
