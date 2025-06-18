export function configurarSidebarMovil() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const hamburgerBtn = document.getElementById("mobile-hamburger"); // ÚNICO botón hamburguesa
  const closeBtn = document.getElementById("close-sidebar");

  if (!sidebar || !overlay || !hamburgerBtn) return;

  // Helper accesibilidad
  const actualizarAriaExpanded = (abierto) => {
    hamburgerBtn.setAttribute("aria-expanded", String(abierto));
  };

  // Animación hamburguesa
  const setHamburgerOpen = (abierto) => {
    if (abierto) {
      hamburgerBtn.classList.add("open");
    } else {
      hamburgerBtn.classList.remove("open");
    }
  };

  const abrirSidebar = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    setHamburgerOpen(true);
    actualizarAriaExpanded(true);
  };

  const cerrarSidebar = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    setHamburgerOpen(false);
    actualizarAriaExpanded(false);
  };

  const cerrarTodosLosSubmenus = () => {
    document.querySelectorAll('.submenu.open').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.submenu-toggle.open').forEach(el => el.classList.remove('open'));
  };

  const cerrarSidebarYSubmenus = () => {
    cerrarSidebar();
    cerrarTodosLosSubmenus();
  };

  hamburgerBtn.addEventListener("click", function () {
    // toggle: abrir si está cerrado, cerrar si está abierto
    const abierto = !sidebar.classList.contains("open");
    if (abierto) {
      abrirSidebar();
    } else {
      cerrarSidebarYSubmenus();
    }
  });

  closeBtn?.addEventListener("click", cerrarSidebar);
  overlay?.addEventListener("click", cerrarSidebar);

  document.querySelectorAll(".sidebar-menu a").forEach((enlace) =>
    enlace.addEventListener("click", cerrarSidebarYSubmenus)
  );
}
