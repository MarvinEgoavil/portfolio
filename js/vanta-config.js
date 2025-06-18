
export function iniciarVantaFondo() {
  if (window.innerWidth > 768) { // solo en pantallas grandes
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
      spacing: 16.0
    });

    // Aseguramos el render con un pequeño resize
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }
}


