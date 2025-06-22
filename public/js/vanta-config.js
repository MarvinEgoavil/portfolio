export function iniciarVantaFondo() {

    let vantaLoaded = false;

    VANTA.NET({
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
      onLoad: function () {
        vantaLoaded = true;
        document.getElementById('background').classList.add('vanta-loaded');
      }
    });

    // Fallback: si en 2 segundos Vanta no carga, oculta igual el fondo artístico
    setTimeout(() => {
      if (!vantaLoaded) {
        document.getElementById('background').classList.add('vanta-loaded');
      }
    }, 2000);

    setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
  }

