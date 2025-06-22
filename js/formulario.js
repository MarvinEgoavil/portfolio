export function inicializarFormularioContacto() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const respuestaDiv = document.getElementById('form-contacto-respuesta');
  const recaptchaInput = document.getElementById('recaptcha-token');

  // Cambia esta URL cuando tengas la de Railway:
  const URL_API = "https://tu-backend-production.up.railway.app/contacto";

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    respuestaDiv.textContent = '';

    const datos = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      mensaje: form.mensaje.value.trim()
    };

    if (!datos.nombre || !datos.email || !datos.mensaje) {
      respuestaDiv.textContent = "Por favor, completa todos los campos.";
      respuestaDiv.style.color = "#f67400";
      return;
    }

    // reCAPTCHA v3 con tu clave pública:
    grecaptcha.ready(function() {
      grecaptcha.execute('6LcyqWgrAAAAAI3WTHzk0DBOAeGbjXZbM8qohuXN', {action: 'submit'})
        .then(async function(token) {
          datos['g-recaptcha-response'] = token;
          if (recaptchaInput) recaptchaInput.value = token; // opcional, debug

          try {
            const res = await fetch(URL_API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(datos)
            });
            const resultado = await res.json();

            if (res.ok && resultado.mensaje) {
              respuestaDiv.textContent = resultado.mensaje;
              respuestaDiv.style.color = "#f6c800";
              form.reset();
              if (recaptchaInput) recaptchaInput.value = "";
            } else {
              respuestaDiv.textContent = resultado.error || "Ocurrió un error al enviar el mensaje.";
              respuestaDiv.style.color = "#ff4444";
            }
          } catch (err) {
            respuestaDiv.textContent = "No se pudo enviar. Inténtalo de nuevo más tarde.";
            respuestaDiv.style.color = "#ff4444";
          }
        });
    });
  });
}
