// vanta-config.js
 let vantaEffect = null;

export function iniciarVantaFondo() {
  let vantaLoaded = false;

  if (vantaEffect && typeof vantaEffect.destroy === "function") {
    vantaEffect.destroy();
  }

  vantaEffect = VANTA.NET({
    el: "#background",
    mouseControls: true,
    touchControls: true,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x8a2be2,
    backgroundColor: 0x000000,
    points: 12.0,
    maxDistance: 20.0,
    spacing: 16.0,
    onInit: function () {
      vantaLoaded = true;
      document.getElementById('background').classList.add('vanta-loaded');
      ocultarPlaceholder();
    }
  });

  setTimeout(() => {
    if (!vantaLoaded) {
      document.getElementById('background').classList.add('vanta-loaded');
      ocultarPlaceholder();
    }
  }, 150000);

  setTimeout(() => window.dispatchEvent(new Event('resize')), 150);

  function ocultarPlaceholder() {
    const ph = document.getElementById('background-placeholder');
    if (ph) {
      ph.style.opacity = '0';
      setTimeout(() => { ph.style.display = 'none'; }, 600);
    }
  }
}




