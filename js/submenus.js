// submenus.js

export function configurarSubmenus() {
  // Encuentra todos los botones/enlaces que abren submenús
  document.querySelectorAll('.submenu-toggle').forEach(toggle => {
    const submenuId = toggle.getAttribute('aria-controls');
    const submenu = document.getElementById(submenuId);

    if (!submenu) return; // Por si acaso

    toggle.addEventListener('click', e => {
      e.preventDefault();

      // Alternar visibilidad y accesibilidad
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isOpen);
      submenu.hidden = isOpen; // hidden = true lo oculta, false lo muestra

      // Si quieres cerrar otros submenús al abrir uno (opcional)
      // document.querySelectorAll('.submenu-toggle').forEach(otherToggle => {
      //   if (otherToggle !== toggle) {
      //     otherToggle.setAttribute('aria-expanded', 'false');
      //     const otherSubmenu = document.getElementById(otherToggle.getAttribute('aria-controls'));
      //     if (otherSubmenu) otherSubmenu.hidden = true;
      //   }
      // });
    });

    // Por accesibilidad, que empiecen ocultos
    submenu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  });
}
