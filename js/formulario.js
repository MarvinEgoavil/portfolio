
export function inicializarFormularioContacto() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const respuestaDiv = document.getElementById(
    "form-contacto-respuesta"
  );

  const URL_API =
    "https://portfolioapi.marvinegoavilz.workers.dev/correo";

  let enviando = false;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (enviando) return;

    respuestaDiv.textContent = "";

    const datos = {
      nombre: form.elements.namedItem("nombre").value.trim(),
      email: form.elements.namedItem("email").value.trim(),
      mensaje: form.elements.namedItem("mensaje").value.trim(),
      turnstileToken: ""
    };

    if (!datos.nombre || !datos.email || !datos.mensaje) {
      respuestaDiv.textContent =
        "Por favor, completa todos los campos.";
      respuestaDiv.style.color = "#f67400";
      return;
    }

    const tokenInput = form.querySelector(
      '[name="cf-turnstile-response"]'
    );

    datos.turnstileToken = tokenInput?.value || "";

    if (!datos.turnstileToken) {
      respuestaDiv.textContent =
        "Completa la verificación de seguridad.";
      respuestaDiv.style.color = "#f67400";
      return;
    }

    const botonEnviar = form.querySelector(
      'button[type="submit"]'
    );

    enviando = true;

    if (botonEnviar) {
      botonEnviar.disabled = true;
    }

    try {
      const res = await fetch(URL_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });

      const resultado = await res.json();

      if (res.ok && resultado.ok === true) {
        respuestaDiv.textContent =
          "Correo enviado correctamente.";
        respuestaDiv.style.color = "#f6c800";

        form.reset();
      } else {
        respuestaDiv.textContent =
          resultado.error ||
          "Ocurrió un error al enviar el correo.";

        respuestaDiv.style.color = "#ff4444";
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);

      respuestaDiv.textContent =
        "No se pudo enviar. Inténtalo de nuevo más tarde.";

      respuestaDiv.style.color = "#ff4444";
    } finally {
      enviando = false;

      if (botonEnviar) {
        botonEnviar.disabled = false;
      }

      // Turnstile utiliza tokens de un solo uso.
      if (window.turnstile) {
        const widget = form.querySelector(".cf-turnstile");

        if (widget) {
          try {
            window.turnstile.reset(widget);
          } catch (error) {
            console.warn(
              "No se pudo reiniciar Turnstile:",
              error
            );
          }
        }
      }
    }
  });
}
