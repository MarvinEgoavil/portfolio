/**
 * Configura el comportamiento del sidebar móvil:
 * - Abrir/cerrar sidebar con accesibilidad y overlay
 * - Cerrar al hacer clic en overlay, enlace, o pulsar ESC
 * - Bloquea el scroll del body al abrir sidebar (incluyendo iOS fix)
 * - Cierra automáticamente al cambiar a escritorio (>768px)
 */
export function configurarSidebarMovil() {
  // Elementos DOM principales
  const sidebar      = document.getElementById("sidebar");
  const overlay      = document.getElementById("overlay");
  const hamburgerBtn = document.getElementById("mobile-hamburger"); // Botón menú
  const closeBtn     = document.getElementById("close-sidebar");    // Botón cerrar (X)

  if (!sidebar || !overlay || !hamburgerBtn || !closeBtn) return;

  // Variables para iOS fix de scroll
  let scrollPos = 0;

  /** Marca el estado ARIA del botón hamburguesa para accesibilidad */
  function actualizarAriaExpanded(abierto) {
    hamburgerBtn.setAttribute("aria-expanded", String(abierto));
  }

  /** Bloquea scroll del body y fija la pantalla (especial para móviles/iOS) */
  function bloquearScroll() {
    scrollPos = window.scrollY || window.pageYOffset;
    document.body.style.top = `-${scrollPos}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100vw";
  }

  /** Desbloquea scroll y restaura posición previa */
  function desbloquearScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollPos);
  }

  /** Abre el sidebar */
  function abrirSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    actualizarAriaExpanded(true);
    document.body.classList.add("sidebar-abierto");
    bloquearScroll();
  }

  /** Cierra el sidebar */
  function cerrarSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    actualizarAriaExpanded(false);
    document.body.classList.remove("sidebar-abierto");
    desbloquearScroll();
    hamburgerBtn.focus(); // Accesibilidad: regresa foco al botón
  }

  /** Cierra todos los submenús abiertos */
  function cerrarTodosLosSubmenus() {
    document.querySelectorAll('.submenu.open').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.submenu-toggle.open').forEach(el => el.classList.remove('open'));
  }

  /** Cierra sidebar y submenús */
  function cerrarSidebarYSubmenus() {
    cerrarSidebar();
    cerrarTodosLosSubmenus();
  }

  // === EVENTOS ===

  // Abre sidebar
  hamburgerBtn.addEventListener("click", abrirSidebar);

  // Cierra sidebar (botón X)
  closeBtn.addEventListener("click", cerrarSidebarYSubmenus);

  // Cierra al hacer click en overlay fuera del sidebar
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) cerrarSidebarYSubmenus();
  });

  // Cierra al hacer click en cualquier enlace del menú
  document.querySelectorAll(".sidebar-menu a").forEach((enlace) =>
    enlace.addEventListener("click", cerrarSidebarYSubmenus)
  );

  // Cierra al pulsar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && document.body.classList.contains("sidebar-abierto")) {
      cerrarSidebarYSubmenus();
    }
  });

  // Cierra sidebar si se cambia a escritorio (>768px)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) cerrarSidebarYSubmenus();
  });
}
