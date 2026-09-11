// firebase.js

import {
    obtenerFirebaseDB
} from "./firebase-config.js";


export function iniciarFirebase() {

    // ======================================================
    // FIREBASE
    // ======================================================

    // Obtenemos la conexión general
    // a Firebase Realtime Database.
    const db =
        obtenerFirebaseDB();


    // === 🔗 ELEMENTOS DEL DOM ===
    const form =
        document.getElementById(
            "testimonial-form"
        );

    const cardsContainer =
        document.getElementById(
            "testimonial-cards"
        );

    const textarea =
        document.getElementById(
            "mensaje"
        );


    // === 🚫 LISTA DE PALABRAS INAPROPIADAS ===
    const malasPalabras = [
        "idiota",
        "imbécil",
        "mierda",
        "tonto",
        "estúpido",
        "puta",
        "jódete",
        "maldito",
        "cabrón",
        "perra",
        "pendejo"
    ];

    // === 📤 EVENTO DEL FORMULARIO ===
    if (form) {
        form.addEventListener("submit", handleSubmit);
    }

    // === ⌨️ CTRL + ENTER / CMD + ENTER ===
    if (textarea && form) {
        textarea.addEventListener("keydown", function (event) {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key === "Enter"
            ) {
                event.preventDefault();
                form.requestSubmit();
            }
        });
    }

    // === 📥 CARGAR TESTIMONIOS ===
    cargarTestimonios();


    // =====================================================
    // ENVIAR FORMULARIO
    // =====================================================

    function handleSubmit(event) {

        event.preventDefault();

        const nombre = obtenerValor("nombre");
        const cargo = obtenerValor("cargo");
        const mensaje = obtenerValor("mensaje");

        const error =
            validarCampoTexto(nombre, "nombre") ||
            validarCampoTexto(cargo, "cargo") ||
            validarTestimonio(mensaje);

        if (error) {
            mostrarMensaje(error, "error");
            return;
        }

        const nuevoTestimonio = {
            nombre,
            cargo,
            mensaje
        };

        guardarTestimonio(nuevoTestimonio);
    }


    // =====================================================
    // OBTENER VALOR
    // =====================================================

    function obtenerValor(id) {

        const elemento = document.getElementById(id);

        if (!elemento) {
            return "";
        }

        return elemento.value.trim();
    }


    // =====================================================
    // VALIDAR NOMBRE / CARGO
    // =====================================================

    function validarCampoTexto(valor, campo) {

        if (!valor || valor.length < 2 || /^\W+$/.test(valor)) {
            return `Por favor, escribe un ${campo} válido.`;
        }

        if (/(.)\1{4,}/.test(valor)) {
            return `El campo "${campo}" tiene caracteres repetidos excesivamente.`;
        }

        return null;
    }


    // =====================================================
    // VALIDAR TESTIMONIO
    // =====================================================

    function validarTestimonio(texto) {

        const limpio = texto
            .toLowerCase()
            .replace(/[^a-zA-Zñáéíóúü\s]/g, "");

        for (const palabra of malasPalabras) {

            if (limpio.includes(palabra)) {
                return "Tu testimonio contiene lenguaje ofensivo.";
            }
        }

        if (limpio.length < 15) {
            return "Tu testimonio es muy corto. Por favor, desarrolla un poco más.";
        }

        if (/(.)\1{4,}/.test(texto)) {
            return "Tu testimonio contiene texto incoherente.";
        }

        if (!/[a-zA-Zñáéíóúü]/.test(texto)) {
            return "El testimonio debe contener texto legible.";
        }

        return null;
    }


    // =====================================================
    // GUARDAR TESTIMONIO
    // =====================================================

    function guardarTestimonio(testimonio) {

        const ref = db.ref("testimonios").push();

        ref.set(testimonio)

            .then(() => {

                // Limpiamos únicamente después de guardar correctamente
                if (form) {
                    form.reset();
                }

                mostrarMensajeDeshacer(
                    "¡Gracias por tu testimonio!",
                    ref.key
                );
            })

            .catch((error) => {

                console.error(
                    "Error al guardar testimonio:",
                    error
                );

                mostrarMensaje(
                    "Ocurrió un error al enviar el testimonio.",
                    "error"
                );
            });
    }


    // =====================================================
    // CARGAR TESTIMONIOS
    // =====================================================

    function cargarTestimonios() {

        db.ref("testimonios").on(
            "value",

            (snapshot) => {

                const data = snapshot.val();

                const contenedor =
                    document.getElementById("testimonial-cards");

                const verTodosBtn =
                    document.getElementById("ver-todos-btn");

                if (!contenedor) {
                    return;
                }

                contenedor.replaceChildren();

                if (verTodosBtn) {
                    verTodosBtn.style.display = "none";
                }

                if (!data) {
                    return;
                }

                const testimonios = Object.values(data);

                const ultimos = testimonios
                    .slice(-3)
                    .reverse();

                ultimos.forEach(agregarTestimonio);

                if (
                    testimonios.length > 3 &&
                    verTodosBtn
                ) {

                    verTodosBtn.style.display = "block";

                    verTodosBtn.onclick = () => {

                        contenedor.replaceChildren();

                        [...testimonios]
                            .reverse()
                            .forEach(agregarTestimonio);

                        verTodosBtn.style.display = "none";
                    };
                }
            },

            (error) => {

                console.error(
                    "Error al cargar testimonios:",
                    error
                );
            }
        );
    }


    // =====================================================
    // CREAR TARJETA DE TESTIMONIO
    // =====================================================

    function agregarTestimonio({
        nombre = "",
        cargo = "",
        mensaje = ""
    }) {

        const contenedor =
            document.getElementById("testimonial-cards");

        if (!contenedor) {
            return;
        }

        const avatar =
            `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(nombre)}`;

        const tarjeta =
            document.createElement("div");

        tarjeta.className = "testimonial-card";


        // Cabecera
        const cabecera =
            document.createElement("div");

        cabecera.style.display = "flex";
        cabecera.style.alignItems = "center";
        cabecera.style.marginBottom = "1rem";


        // Avatar
        const imagen =
            document.createElement("img");

        imagen.src = avatar;
        imagen.alt = "Avatar";
        imagen.width = 36;
        imagen.height = 36;

        imagen.style.width = "36px";
        imagen.style.height = "36px";
        imagen.style.borderRadius = "50%";
        imagen.style.marginRight = "0.6rem";


        // Información
        const info =
            document.createElement("div");

        const cargoElemento =
            document.createElement("strong");

        /*
         * IMPORTANTE:
         * textContent evita interpretar contenido introducido
         * por el usuario como HTML.
         */
        cargoElemento.textContent = cargo;


        const salto =
            document.createElement("br");


        const nombreElemento =
            document.createElement("span");

        nombreElemento.style.fontSize = "0.85rem";
        nombreElemento.style.color = "#ccc";

        nombreElemento.textContent = `— ${nombre}`;


        info.append(
            cargoElemento,
            salto,
            nombreElemento
        );


        cabecera.append(
            imagen,
            info
        );


        // Mensaje
        const mensajeElemento =
            document.createElement("p");

        mensajeElemento.style.fontStyle = "italic";

        mensajeElemento.textContent =
            `“${mensaje}”`;


        tarjeta.append(
            cabecera,
            mensajeElemento
        );


        contenedor.appendChild(tarjeta);
    }


    // =====================================================
    // MENSAJES
    // =====================================================

    function mostrarMensaje(
        texto,
        tipo = "info"
    ) {

        Swal.fire({
            icon: tipo,
            text: texto,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            background: "#222",
            color: "#fff",
            iconColor:
                tipo === "success"
                    ? "#8e2de2"
                    : "#ff3860"
        });
    }


    // =====================================================
    // MENSAJE CON OPCIÓN DESHACER
    // =====================================================

    function mostrarMensajeDeshacer(
        mensaje,
        keyTestimonio
    ) {

        Swal.fire({

            icon: "success",

            html:
                `${mensaje}<br><br>` +
                `<button
                    id="deshacer-btn"
                    style="
                        background:#8e2de2;
                        color:#fff;
                        padding:6px 16px;
                        border:none;
                        border-radius:6px;
                        font-weight:bold;
                        cursor:pointer;
                    ">
                    Deshacer
                </button>`,

            toast: true,

            position: "top-end",

            showConfirmButton: false,

            timer: 5000,

            background: "#222",

            color: "#fff",

            iconColor: "#8e2de2",

            didOpen: () => {

                const btn =
                    document.getElementById(
                        "deshacer-btn"
                    );

                if (!btn) {
                    return;
                }

                btn.addEventListener(
                    "click",

                    async () => {

                        try {

                            /*
                             * Ahora db funciona correctamente porque
                             * esta función está dentro de iniciarFirebase().
                             */
                            await db
                                .ref(
                                    "testimonios/" +
                                    keyTestimonio
                                )
                                .remove();

                            Swal.close();

                            mostrarMensaje(
                                "Testimonio eliminado.",
                                "info"
                            );

                        } catch (error) {

                            console.error(
                                "Error al eliminar testimonio:",
                                error
                            );

                            mostrarMensaje(
                                "No se pudo eliminar el testimonio.",
                                "error"
                            );
                        }
                    }
                );
            }
        });
    }
}