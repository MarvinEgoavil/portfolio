// firebase.js

export function iniciarFirebase() {
    // === 🔧 CONFIGURACIÓN DE FIREBASE ===
    const firebaseConfig = {
        apiKey: "TU_API_KEY",
        authDomain: "portofolio-marvin.firebaseapp.com",
        databaseURL: "https://portofolio-marvin-default-rtdb.europe-west1.firebasedatabase.app/",
        projectId: "portofolio-marvin",
        storageBucket: "portofolio-marvin.appspot.com",
        messagingSenderId: "TU_SENDER_ID",
        appId: "TU_APP_ID"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // === 🔗 ELEMENTOS DEL DOM ===
    const form = document.getElementById("testimonial-form");
    const cardsContainer = document.getElementById("testimonial-cards");

    // === 🚫 LISTA DE PALABRAS INAPROPIADAS ===
    const malasPalabras = [
        "idiota", "imbécil", "mierda", "tonto", "estúpido",
        "puta", "jódete", "maldito", "cabrón", "perra", "pendejo"
    ];

    if (form) {
        form.addEventListener("submit", handleSubmit);
    }
    cargarTestimonios();

    // === 📤 ENVÍO DEL FORMULARIO ===
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

        const nuevoTestimonio = { nombre, cargo, mensaje };
        guardarTestimonio(nuevoTestimonio);
        form.reset();
    }

    function obtenerValor(id) {
        return document.getElementById(id).value.trim();
    }

    function validarCampoTexto(valor, campo) {
        if (!valor || valor.length < 2 || /^\W+$/.test(valor)) {
            return `Por favor, escribe un ${campo} válido.`;
        }
        if (/(.)\1{4,}/.test(valor)) {
            return `El campo "${campo}" tiene caracteres repetidos excesivamente.`;
        }
        return null;
    }

    function validarTestimonio(texto) {
        const limpio = texto.toLowerCase().replace(/[^a-zA-Zñáéíóúü\s]/g, "");
        for (let palabra of malasPalabras) {
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

    function guardarTestimonio(testimonio) {
        // Guardamos el testimonio y obtenemos la referencia (key)
        const ref = db.ref("testimonios").push();
        ref.set(testimonio)
            .then(() => {
                mostrarMensajeDeshacer("¡Gracias por tu testimonio!", ref.key);
            })
            .catch((error) => {
                console.error("Error al guardar testimonio:", error);
                mostrarMensaje("Ocurrió un error al enviar el testimonio.", "error");
            });
    }


    function cargarTestimonios() {
        db.ref("testimonios").on("value", (snapshot) => {
            const data = snapshot.val();
            const cardsContainer = document.getElementById("testimonial-cards");
            const verTodosBtn = document.getElementById("ver-todos-btn");

            if (!cardsContainer) return;

            cardsContainer.innerHTML = "";
            if (verTodosBtn) verTodosBtn.style.display = "none";

            if (data) {
                const testimonios = Object.values(data);
                const ultimos = testimonios.slice(-3).reverse();
                ultimos.forEach(agregarTestimonio);

                if (testimonios.length > 3 && verTodosBtn) {
                    verTodosBtn.style.display = "block";
                    verTodosBtn.onclick = () => {
                        cardsContainer.innerHTML = "";
                        testimonios.reverse().forEach(agregarTestimonio);
                        verTodosBtn.style.display = "none";
                    };
                }
            }
        });
    }

    function agregarTestimonio({ nombre, cargo, mensaje }) {
        const avatar = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(nombre)}`;
        const tarjeta = document.createElement("div");
        tarjeta.className = "testimonial-card";
        tarjeta.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
            <img src="${avatar}" alt="Avatar" style="width: 36px; height: 36px; border-radius: 50%; margin-right: 0.6rem;" />
            <div>
                <strong>${cargo}</strong><br />
                <span style="font-size: 0.85rem; color: #ccc;">— ${nombre}</span>
            </div>
        </div>
        <p style="font-style: italic;">“${mensaje}”</p>
        `;
        document.getElementById("testimonial-cards").appendChild(tarjeta);
    }

    function mostrarMensaje(texto, tipo = "info") {
        Swal.fire({
            icon: tipo,
            text: texto,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            background: '#222',
            color: '#fff',
            iconColor: tipo === 'success' ? '#8e2de2' : '#ff3860'
        });
    }
}

function mostrarMensajeDeshacer(mensaje, keyTestimonio) {
    let undoTimeout = null;

    Swal.fire({
        icon: "success",
        html: `${mensaje} <br><br><button id="deshacer-btn" style="background:#8e2de2;color:#fff;padding:6px 16px;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">Deshacer</button>`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        background: '#222',
        color: '#fff',
        iconColor: '#8e2de2',
        didOpen: () => {
            const btn = document.getElementById("deshacer-btn");
            if (btn) {
                btn.addEventListener("click", () => {
                    clearTimeout(undoTimeout);
                    db.ref("testimonios/" + keyTestimonio).remove();
                    Swal.fire({
                        icon: "info",
                        text: "Testimonio eliminado.",
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        background: '#222',
                        color: '#fff'
                    });
                });
            }
        }
    });

    // Si no hizo clic en "Deshacer" en 5 segundos, se borra el mensaje y ya no puede deshacer
    undoTimeout = setTimeout(() => { }, 5000);
}


/* * Agregar soporte para enviar el formulario con Ctrl+Enter o Cmd+Enter
 */

const form = document.getElementById("testimonial-form");
const textarea = document.getElementById("mensaje");
if (textarea) {
    textarea.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            form.requestSubmit();
        }
    });
}


