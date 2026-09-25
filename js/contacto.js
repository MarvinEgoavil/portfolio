export function inicializarContacto() {

  const botones = document.querySelectorAll(
    '#contacto .contacto-channel'
  );

  const panel = document.getElementById('contacto-channel-content');

  if (!botones.length || !panel) return;


  // ==================================================
  // DATOS DE CONTACTO
  // ==================================================

  const TELEFONO_VISIBLE = '722 516 228';
  const TELEFONO_INTERNACIONAL = '+34722516228';

  const TELEGRAM_USUARIO = 'Alucard1608';


  // ==================================================
  // GUARDAR PANEL ORIGINAL DE CORREO
  // ==================================================

  const panelCorreo = document.createElement('div');
  panelCorreo.className = 'contacto-panel-email';

  /*
    Movemos el formulario original.
    NO lo clonamos para conservar sus listeners.
  */
  while (panel.firstChild) {
    panelCorreo.appendChild(panel.firstChild);
  }


  // ==================================================
  // ACTIVAR BOTÓN
  // ==================================================

  function activarBoton(botonActivo) {

    botones.forEach((boton) => {

      const activo = boton === botonActivo;

      boton.classList.toggle('active', activo);
      boton.setAttribute('aria-selected', String(activo));

    });

  }


  // ==================================================
  // LIMPIAR PANEL
  // ==================================================

  function limpiarPanel() {

    while (panel.firstChild) {
      panel.removeChild(panel.firstChild);
    }

  }


  // ==================================================
  // CREAR CABECERA REUTILIZABLE
  // ==================================================

  function crearCabecera(iconClass, titulo, descripcion) {

    const cabecera = document.createElement('div');
    cabecera.className = 'contacto-v2-panel-header';

    const icono = document.createElement('span');
    icono.className = 'contacto-v2-panel-icon';

    const i = document.createElement('i');
    i.className = iconClass;
    i.setAttribute('aria-hidden', 'true');

    icono.appendChild(i);

    const textos = document.createElement('div');

    const h3 = document.createElement('h3');
    h3.textContent = titulo;

    const p = document.createElement('p');
    p.textContent = descripcion;

    textos.appendChild(h3);
    textos.appendChild(p);

    cabecera.appendChild(icono);
    cabecera.appendChild(textos);

    return cabecera;

  }


  // ==================================================
  // CREAR BOTÓN / ENLACE
  // ==================================================

  function crearEnlace(href, iconClass, texto, nuevaVentana = false) {

    const enlace = document.createElement('a');

    enlace.href = href;
    enlace.className = 'contacto-v2-submit';

    if (nuevaVentana) {
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
    }

    const icono = document.createElement('i');
    icono.className = iconClass;
    icono.setAttribute('aria-hidden', 'true');

    const span = document.createElement('span');
    span.textContent = texto;

    enlace.appendChild(icono);
    enlace.appendChild(span);

    return enlace;

  }


  // ==================================================
  // CORREO
  // ==================================================

  function mostrarCorreo() {

    limpiarPanel();

    panel.appendChild(panelCorreo);

    panel.setAttribute(
      'aria-labelledby',
      'contacto-tab-email'
    );

  }


  // ==================================================
  // WHATSAPP
  // ==================================================

  function mostrarWhatsApp() {

    limpiarPanel();

    panel.setAttribute(
      'aria-labelledby',
      'contacto-tab-whatsapp'
    );

    const contenedor = document.createElement('div');
    contenedor.className = 'contacto-v2-whatsapp';

    const cabecera = crearCabecera(
      'fab fa-whatsapp',
      'Hablemos por WhatsApp',
      'Puedes escribirme directamente. Normalmente respondo lo antes posible.'
    );

    const caja = document.createElement('div');
    caja.className = 'contacto-call-box';

    const icono = document.createElement('div');
    icono.className = 'contacto-call-icon';

    icono.innerHTML =
      '<i class="fab fa-whatsapp" aria-hidden="true"></i>';

    const numero = document.createElement('p');
    numero.className = 'contacto-phone-number';
    numero.textContent = `+34 ${TELEFONO_VISIBLE}`;

    const mensaje =
      'Hola Marvin, he visto tu portfolio y me gustaría ponerme en contacto contigo.';

    const enlace = crearEnlace(
      `https://wa.me/34722516228?text=${encodeURIComponent(mensaje)}`,
      'fab fa-whatsapp',
      'Abrir WhatsApp',
      true
    );

    caja.appendChild(icono);
    caja.appendChild(numero);
    caja.appendChild(enlace);

    contenedor.appendChild(cabecera);
    contenedor.appendChild(caja);

    panel.appendChild(contenedor);

  }


  // ==================================================
  // TELEGRAM
  // ==================================================

  function mostrarTelegram() {

    limpiarPanel();

    panel.setAttribute(
      'aria-labelledby',
      'contacto-tab-telegram'
    );

    const contenedor = document.createElement('div');

    const cabecera = crearCabecera(
      'fab fa-telegram-plane',
      'Hablemos por Telegram',
      'Puedes contactarme directamente a través de Telegram.'
    );

    const caja = document.createElement('div');
    caja.className = 'contacto-call-box';

    const icono = document.createElement('div');
    icono.className = 'contacto-call-icon';

    icono.innerHTML =
      '<i class="fab fa-telegram-plane" aria-hidden="true"></i>';

    const usuario = document.createElement('p');
    usuario.className = 'contacto-phone-number';
    usuario.textContent = `@${TELEGRAM_USUARIO}`;

    const enlace = crearEnlace(
      `https://t.me/${TELEGRAM_USUARIO}`,
      'fab fa-telegram-plane',
      'Abrir Telegram',
      true
    );

    caja.appendChild(icono);
    caja.appendChild(usuario);
    caja.appendChild(enlace);

    contenedor.appendChild(cabecera);
    contenedor.appendChild(caja);

    panel.appendChild(contenedor);

  }


  // ==================================================
  // LLAMAR
  // ==================================================

  function mostrarLlamar() {

    limpiarPanel();

    panel.setAttribute(
      'aria-labelledby',
      'contacto-tab-call'
    );

    const contenedor = document.createElement('div');

    const cabecera = crearCabecera(
      'fas fa-phone-alt',
      '¿Prefieres hablar?',
      'Puedes llamarme directamente desde tu dispositivo.'
    );

    const caja = document.createElement('div');
    caja.className = 'contacto-call-box';

    const icono = document.createElement('div');
    icono.className = 'contacto-call-icon';

    icono.innerHTML =
      '<i class="fas fa-phone-alt" aria-hidden="true"></i>';

    const numero = document.createElement('p');
    numero.className = 'contacto-phone-number';
    numero.textContent = `+34 ${TELEFONO_VISIBLE}`;

    const enlace = crearEnlace(
      `tel:${TELEFONO_INTERNACIONAL}`,
      'fas fa-phone-alt',
      'Llamar ahora'
    );

    caja.appendChild(icono);
    caja.appendChild(numero);
    caja.appendChild(enlace);

    contenedor.appendChild(cabecera);
    contenedor.appendChild(caja);

    panel.appendChild(contenedor);

  }


  // ==================================================
  // SMS
  // ==================================================

// ==================================================
// SMS / MENSAJE DIRECTO AL MÓVIL
// ==================================================

function mostrarSMS() {

  limpiarPanel();

  panel.setAttribute(
    'aria-labelledby',
    'contacto-tab-sms'
  );


  // CONTENEDOR PRINCIPAL
  const contenedor = document.createElement('div');
  contenedor.className = 'contacto-v2-sms';


  // ==================================================
  // CABECERA
  // ==================================================

  const cabecera = crearCabecera(
    'fas fa-comment-alt',
    'Envíame un mensaje',
    'El mensaje llegará directamente a mi móvil.'
  );

  contenedor.appendChild(cabecera);


  // ==================================================
  // FORMULARIO
  // ==================================================

  const form = document.createElement('form');

  form.id = 'contact-sms-form';
  form.className = 'contact-form contacto-v2-form';


  // ------------------------------
  // NOMBRE
  // ------------------------------

  const labelNombre = document.createElement('label');

  const textoNombre = document.createElement('span');
  textoNombre.textContent = 'Tu nombre';

  const inputNombre = document.createElement('input');

  inputNombre.type = 'text';
  inputNombre.name = 'nombre';
  inputNombre.placeholder = '¿Cómo te llamas?';
  inputNombre.autocomplete = 'name';
  inputNombre.required = true;

  labelNombre.appendChild(textoNombre);
  labelNombre.appendChild(inputNombre);


  // ------------------------------
  // CORREO
  // ------------------------------

  const labelEmail = document.createElement('label');

  const textoEmail = document.createElement('span');
  textoEmail.textContent = 'Tu correo electrónico';

  const inputEmail = document.createElement('input');

  inputEmail.type = 'email';
  inputEmail.name = 'email';
  inputEmail.placeholder = 'tu@email.com';
  inputEmail.autocomplete = 'email';
  inputEmail.required = true;

  labelEmail.appendChild(textoEmail);
  labelEmail.appendChild(inputEmail);


  // ------------------------------
  // MENSAJE
  // ------------------------------

  const labelMensaje = document.createElement('label');

  const textoMensaje = document.createElement('span');
  textoMensaje.textContent = 'Mensaje';

  const textarea = document.createElement('textarea');

  textarea.name = 'mensaje';
  textarea.placeholder = 'Escribe tu mensaje...';
  textarea.required = true;
  textarea.maxLength = 500;

  labelMensaje.appendChild(textoMensaje);
  labelMensaje.appendChild(textarea);


  // ==================================================
  // BOTÓN
  // ==================================================

  const botonEnviar = document.createElement('button');

  botonEnviar.type = 'submit';
  botonEnviar.className = 'contacto-v2-submit';

  const iconoBoton = document.createElement('i');

  iconoBoton.className = 'fas fa-comment-alt';
  iconoBoton.setAttribute('aria-hidden', 'true');

  const textoBoton = document.createElement('span');
  textoBoton.textContent = 'Enviar mensaje';

  botonEnviar.appendChild(iconoBoton);
  botonEnviar.appendChild(textoBoton);


  // ==================================================
  // RESPUESTA
  // ==================================================

  const respuesta = document.createElement('div');

  respuesta.className = 'form-respuesta';
  respuesta.setAttribute('aria-live', 'polite');


  // ==================================================
  // MONTAR FORMULARIO
  // ==================================================

  form.appendChild(labelNombre);
  form.appendChild(labelEmail);
  form.appendChild(labelMensaje);
  form.appendChild(botonEnviar);
  form.appendChild(respuesta);

  contenedor.appendChild(form);


  // ==================================================
  // PRIVACIDAD
  // ==================================================

  const privacidad = document.createElement('div');
  privacidad.className = 'contacto-v2-privacy';

  const escudo = document.createElement('i');

  escudo.className = 'fas fa-shield-alt';
  escudo.setAttribute('aria-hidden', 'true');

  const textoPrivacidad = document.createElement('span');

  textoPrivacidad.textContent =
    'Mensaje enviado de forma segura. No comparto tu información con terceros.';

  privacidad.appendChild(escudo);
  privacidad.appendChild(textoPrivacidad);

  contenedor.appendChild(privacidad);


  // ==================================================
  // EVENTO DEL FORMULARIO
  // ==================================================

form.addEventListener('submit', async (e) => {

  e.preventDefault();

  respuesta.textContent = '';

  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim();
  const mensaje = textarea.value.trim();


  // ==========================================
  // VALIDACIÓN
  // ==========================================

  if (!nombre || !email || !mensaje) {

    respuesta.textContent =
      'Por favor, completa todos los campos.';

    respuesta.style.color = '#f67400';

    return;
  }


  // ==========================================
  // ESTADO: ENVIANDO
  // ==========================================

  botonEnviar.disabled = true;

  textoBoton.textContent = 'Enviando...';

  respuesta.textContent = '';


  try {

    // ==========================================
    // ENVIAR AL CLOUDFLARE WORKER
    // ==========================================

    const response = await fetch(
      'https://portfolioapi.marvinegoavilz.workers.dev/mensaje',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          nombre,
          email,
          mensaje
        })
      }
    );


    const data = await response.json();


    // ==========================================
    // RESPUESTA CORRECTA
    // ==========================================

    if (response.ok && data.ok) {

      respuesta.textContent =
        '✓ Mensaje recibido correctamente.';

      respuesta.style.color = '#4ade80';

      form.reset();

      return;
    }


    // ==========================================
    // ERROR DEVUELTO POR LA API
    // ==========================================

    respuesta.textContent =
      data.error || 'No se pudo enviar el mensaje.';

    respuesta.style.color = '#ff4444';


  } catch (error) {

    console.error(
      'Error al conectar con Portfolio API:',
      error
    );

    respuesta.textContent =
      'No se pudo conectar con el servidor.';

    respuesta.style.color = '#ff4444';


  } finally {

    // ==========================================
    // RESTAURAR BOTÓN
    // ==========================================

    botonEnviar.disabled = false;

    textoBoton.textContent = 'Enviar mensaje';

  }

});


  // ==================================================
  // MOSTRAR
  // ==================================================

  panel.appendChild(contenedor);

}


  // ==================================================
  // A TERCERO
  // ==================================================

  function mostrarTercero() {

    limpiarPanel();

    panel.setAttribute(
      'aria-labelledby',
      'contacto-tab-third-party'
    );

    const contenedor = document.createElement('div');

    const cabecera = crearCabecera(
      'fas fa-lock',
      'Comunicación a tercero',
      'Esta función estará disponible próximamente.'
    );

    const caja = document.createElement('div');
    caja.className = 'contacto-lock-box';

    const icono = document.createElement('div');
    icono.className = 'contacto-lock-icon';

    icono.innerHTML =
      '<i class="fas fa-lock" aria-hidden="true"></i>';

    const titulo = document.createElement('h4');
    titulo.textContent = 'Próximamente';

    const descripcion = document.createElement('p');

    descripcion.textContent =
      'Estoy preparando una forma segura de enviar una comunicación a otra persona desde esta sección.';

    caja.appendChild(icono);
    caja.appendChild(titulo);
    caja.appendChild(descripcion);

    contenedor.appendChild(cabecera);
    contenedor.appendChild(caja);

    panel.appendChild(contenedor);

  }


  // ==================================================
  // EVENTOS
  // ==================================================

  botones.forEach((boton) => {

    boton.addEventListener('click', () => {

      const canal = boton.dataset.channel;

      activarBoton(boton);

      switch (canal) {

        case 'email':
          mostrarCorreo();
          break;

        case 'whatsapp':
          mostrarWhatsApp();
          break;

        case 'telegram':
          mostrarTelegram();
          break;

        case 'call':
          mostrarLlamar();
          break;

        case 'sms':
          mostrarSMS();
          break;

        case 'third-party':
          mostrarTercero();
          break;

      }

    });

  });


// ==================================================
// ESTADO INICIAL
// ==================================================

const botonCorreoInicial = Array.from(botones).find(
  (boton) => boton.dataset.channel === 'email'
);

if (botonCorreoInicial) {
  activarBoton(botonCorreoInicial);
}

panel.setAttribute(
  'aria-labelledby',
  'contacto-tab-email'
);

setTimeout(() => {
  mostrarCorreo();
}, 300);

}