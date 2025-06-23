export function configurarHeaderStickyAnimado(selector = "header") {
  let lastScroll = 0;
  const header = document.querySelector(selector);
  if (!header) return;

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll && currentScroll > 80) {
      // Scroll hacia abajo y no al tope
      header.style.transform = "translateY(-100%)";
    } else {
      // Scroll arriba o cerca del tope
      header.style.transform = "translateY(0)";
    }
    lastScroll = currentScroll;
  });
}
