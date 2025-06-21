export function inicializarFormularioContacto() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const respuestaDiv = document.getElementById('form-contacto-respuesta');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    respuestaDiv.textContent = ''; // Limpia mensaje previo

    // Toma valores del form
    const datos = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      mensaje: form.mensaje.value.trim()
    };

    // Validación básica (opcional)
    if (!datos.nombre || !datos.email || !datos.mensaje) {
      respuestaDiv.textContent = "Por favor, completa todos los campos.";
      respuestaDiv.style.color = "#f67400";
      return;
    }

    // Envía a tu API (ajusta URL si tienes dominio)
    try {
      const res = await fetch('http://localhost:3001/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const resultado = await res.json();

      if (res.ok && resultado.mensaje) {
        respuestaDiv.textContent = resultado.mensaje;
        respuestaDiv.style.color = "#f6c800";
        form.reset();
      } else {
        respuestaDiv.textContent = resultado.error || "Ocurrió un error al enviar el mensaje.";
        respuestaDiv.style.color = "#ff4444";
      }
    } catch (err) {
      respuestaDiv.textContent = "No se pudo enviar. Inténtalo de nuevo más tarde.";
      respuestaDiv.style.color = "#ff4444";
    }
  });
}
