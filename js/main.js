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


// Si quieres mantener el efecto de sacudida cuando el scroll es rápido,
// pero SIN mover la posición:
document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll('.social-icon');
  const menu = document.querySelector('.social-menu');
  const footer = document.getElementById('footer');
  let lastScrollY = window.scrollY;
  let lastTime = performance.now();
  let velocity = 0;

  function triggerStormIfFast() {
    const now = performance.now();
    const deltaY = Math.abs(window.scrollY - lastScrollY);
    const deltaTime = now - lastTime;
    velocity = deltaY / Math.max(deltaTime, 1); // px/ms

    if (velocity > 0.4) {
      icons.forEach((icon, i) => {
        icon.classList.remove('sacudida', 'rebote');
        setTimeout(() => icon.classList.add('sacudida'), i * 44);
        setTimeout(() => icon.classList.remove('sacudida'), 400 + i * 44);
        setTimeout(() => icon.classList.add('rebote'), 410 + i * 44);
        setTimeout(() => icon.classList.remove('rebote'), 870 + i * 44);
      });
    }
    lastScrollY = window.scrollY;
    lastTime = now;
  }

  function ajustarMenuSocial() {
    if (!menu || !footer) return;
    // Normalmente lo tienes fijo:
    menu.style.top = "50%";
    menu.style.transform = "translateY(-50%)";
    // Ahora evitamos que pise el footer:
    const menuRect = menu.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const padding = 32; // separación del footer
    if (menuRect.bottom > footerRect.top - padding) {
      // Lo subimos lo necesario para que no tape el footer
      const overlap = menuRect.bottom - (footerRect.top - padding);
      menu.style.top = `calc(50% - ${overlap}px)`;
      menu.style.transform = "translateY(-50%)";
    }
  }

  window.addEventListener('scroll', () => {
    triggerStormIfFast();
    ajustarMenuSocial();
  });
  window.addEventListener('resize', ajustarMenuSocial);

  // Inicial
  ajustarMenuSocial();
});


/* FOOTER */

// ⬇️ Pega esto al final de tu main.js o en un script aparte
