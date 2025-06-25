// === Importación de módulos personalizados (ajusta rutas según tu estructura) ===
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
import { inicializarBuscador } from './buscador.js';
import { inicializarTitulo,inicializarCertModal } from './modals.js';

// === Función principal: inicialización global ===
document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de módulos y componentes
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
  inicializarBuscador();
  inicializarTitulo();
  inicializarCertModal();
})


// === SOCIAL-MENU: Animación SVG profesional === //


document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector('.social-menu');
  const icons = document.querySelectorAll('.social-icon');
  const header = document.querySelector('header');
  const headerRect = header.getBoundingClientRect();
  const headerHeight = headerRect.height;

  let lastScrollY = window.scrollY;
  let lastTime = performance.now();
  let velocity = 0;

  function updateMenuPosition() {
    const margin = 36; // Espacio desde abajo del header
    let targetTop = window.scrollY + headerHeight + margin;
    // Limita el top para no subir sobre el header
    menu.style.top = `${targetTop}px`;
  }

  function triggerStormIfFast() {
    const now = performance.now();
    const deltaY = Math.abs(window.scrollY - lastScrollY);
    const deltaTime = now - lastTime;
    velocity = deltaY / Math.max(deltaTime, 1); // px/ms

    // Detecta scroll fuerte
    if (velocity > 0.4) { // Puedes ajustar este valor
      icons.forEach((icon, i) => {
        icon.classList.remove('sacudida', 'rebote');
        setTimeout(() => icon.classList.add('sacudida'), i * 44);
        setTimeout(() => icon.classList.remove('sacudida'), 400 + i * 44);
        // Rebote después de la sacudida
        setTimeout(() => icon.classList.add('rebote'), 410 + i * 44);
        setTimeout(() => icon.classList.remove('rebote'), 870 + i * 44);
      });
    }
    lastScrollY = window.scrollY;
    lastTime = now;
  }

  // Llama ambas funciones en scroll
  window.addEventListener('scroll', () => {
    updateMenuPosition();
    triggerStormIfFast();
  });

  // Inicial al cargar
  updateMenuPosition();
});

