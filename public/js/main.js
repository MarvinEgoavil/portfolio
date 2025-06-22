import { configurarSidebarMovil } from './sidebar.js';
import { configurarEmojiGuiñador } from './emoji.js';
import { configurarSubmenus } from './submenus.js';
import { iniciarIdioma } from './idiomas.js';
import { iniciarVantaFondo } from './vanta-config.js';
import { iniciarFirebase } from './firebase.js';
import { inicializarMapaContacto } from './mapa.js';  
import { inicializarFormularioContacto} from './formulario.js';


// 🚀 INICIALIZACIÓN AL CARGAR DOM
document.addEventListener("DOMContentLoaded", () => {
  configurarSidebarMovil();
  configurarEmojiGuiñador();
  configurarSubmenus();
  iniciarIdioma();
  iniciarVantaFondo();
  iniciarFirebase();
  inicializarMapaContacto();
  inicializarFormularioContacto();

  // --- Limpiar buscador al hacer focus y restaurar comportamiento UX ---
  const buscador = document.querySelector('.buscador-seccion input');
  const placeholderOriginal = buscador ? buscador.placeholder : '';

  if (buscador) {
    // Cuando haces focus o hover: borra el placeholder
    function borrarPlaceholder() {
      buscador.placeholder = '';
    }
    buscador.addEventListener('focus', borrarPlaceholder);
    buscador.addEventListener('mouseenter', borrarPlaceholder);

    // Cuando quitas el focus: restaura si está vacío
    buscador.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.placeholder = placeholderOriginal;
      }
    });

    // Cuando sale el mouse y el campo está vacío: restaura también
    buscador.addEventListener('mouseleave', function() {
      if (document.activeElement !== buscador && this.value.trim() === '') {
        this.placeholder = placeholderOriginal;
      }
    });
  }
});

/* Capturando el token */ 

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const recaptchaInput = document.getElementById('recaptcha-token');

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevenir envío normal

    grecaptcha.ready(() => {
      grecaptcha.execute('6Ld9TWkrAAAAAC_JVShrurJmr29KzKJ7pDSLajkH', {action: 'submit'})
        .then(token => {
          recaptchaInput.value = token; // Poner token en el input hidden
          form.submit(); // Ahora sí envía el formulario con el token incluido
        });
    });
  });
});
