import { configurarSidebarMovil } from './sidebar.js';
import { configurarEmojiGuiñador } from './emoji.js';
import { configurarSubmenus } from './submenus.js';
import { iniciarIdioma } from './idiomas.js';
import { iniciarVantaFondo } from './vanta-config.js';
import { iniciarFirebase } from './firebase.js';
import { inicializarMapaContacto } from './mapa.js';  
import { inicializarFormularioContacto } from './formulario.js';
import { configurarHeaderStickyAnimado } from './headerScroll.js';
import { iniciarCanvas2d } from './canvas2d.js';

document.addEventListener("DOMContentLoaded", () => {
  configurarSidebarMovil();
  configurarEmojiGuiñador();
  configurarSubmenus();
  iniciarIdioma();
  iniciarVantaFondo();
  iniciarFirebase();
  inicializarMapaContacto();
  inicializarFormularioContacto();
  configurarHeaderStickyAnimado();
  iniciarCanvas2d();


  // --- Limpiar buscador al hacer focus y restaurar comportamiento UX ---
  const buscador = document.querySelector('.buscador-seccion input');
  const placeholderOriginal = buscador ? buscador.placeholder : '';

  if (buscador) {
    function borrarPlaceholder() {
      buscador.placeholder = '';
    }
    buscador.addEventListener('focus', borrarPlaceholder);
    buscador.addEventListener('mouseenter', borrarPlaceholder);

    buscador.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.placeholder = placeholderOriginal;
      }
    });

    buscador.addEventListener('mouseleave', function() {
      if (document.activeElement !== buscador && this.value.trim() === '') {
        this.placeholder = placeholderOriginal;
      }
    });
  }
});

// Bloquea el menú contextual (clic derecho) en toda la página
window.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});