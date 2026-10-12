export function inicializarFormularioContacto() {
  const form = document.getElementById("contact-form");
  const pantalla = document.getElementById("contacto-correo-estado");
  const titulo = document.getElementById("correo-estado-titulo");
  const descripcion = document.getElementById("correo-estado-descripcion");
  const accion = document.getElementById("correo-estado-accion");
  const respuesta = document.getElementById("form-contacto-respuesta");

  if (!form || !pantalla || !titulo || !descripcion || !accion) {
    return;
  }

  const URL_API =
    "https://portfolioapi.marvinegoavilz.workers.dev/correo";

  let enviando = false;

  const botonEnviar = form.querySelector('button[type="submit"]');

  function mostrarFormulario() {
    pantalla.hidden = true;
    form.hidden = false;
    accion.hidden = true;
  }

  function mostrarEstado(estado, mensajeTitulo, mensajeDescripcion) {
    form.hidden = true;
    pantalla.hidden = false;
    pantalla.dataset.estado = estado;

    titulo.textContent = mensajeTitulo;
    descripcion.textContent = mensajeDescripcion;

    accion.hidden = estado === "sending";
  }

function reiniciarTurnstile() {
  const widget = form.querySelector(".cf-turnstile");

  if (!window.turnstile || !widget) return;

  const widgetId = widget.dataset.widgetId;

  if (!widgetId) return;

  try {
    window.turnstile.reset(widgetId);
  } catch (error) {
    console.warn("No se pudo reiniciar Turnstile:", error);
  }
}

  accion.addEventListener("click", () => {
    if (enviando) return;

    if (pantalla.dataset.estado === "success") {
      form.reset();
    }

    mostrarFormulario();
    reiniciarTurnstile();
   
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (enviando) return;

    const datos = {
      nombre: form.elements.namedItem("nombre").value.trim(),
      email: form.elements.namedItem("email").value.trim(),
      mensaje: form.elements.namedItem("mensaje").value.trim(),
      turnstileToken: ""
    };

    if (!datos.nombre || !datos.email || !datos.mensaje) {
      respuesta.textContent = "Completa todos los campos.";
      respuesta.style.color = "#ff7c91";
      return;
    }

    const tokenInput = form.querySelector(
      '[name="cf-turnstile-response"]'
    );

    datos.turnstileToken = tokenInput?.value || "";

    if (!datos.turnstileToken) {
      respuesta.textContent = "Completa la verificación de seguridad.";
      respuesta.style.color = "#ff7c91";
      return;
    }

    enviando = true;
    respuesta.textContent = "";

    if (botonEnviar) botonEnviar.disabled = true;

    mostrarEstado(
      "sending",
      "Enviando tu mensaje...",
      "Estamos procesando tu correo de forma segura."
    );

    try {
      const res = await fetch(URL_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });

      const resultado = await res.json();

      if (!res.ok || resultado.ok !== true) {
        throw new Error(
          resultado.error || "No se pudo enviar el correo."
        );
      }

      mostrarEstado(
        "success",
        "¡Mensaje enviado correctamente!",
        "Gracias por escribirme. Te responderé lo antes posible."
      );

      accion.textContent = "Enviar otro mensaje";

    } catch (error) {
      console.error("Error al enviar correo:", error);

      mostrarEstado(
        "error",
        "No se pudo enviar el mensaje",
        "Ha ocurrido un problema. Puedes volver al formulario e intentarlo de nuevo."
      );

      accion.textContent = "Volver al formulario";

    } finally {
      enviando = false;

      if (botonEnviar) botonEnviar.disabled = false;
    }
  });
}