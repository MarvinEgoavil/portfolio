export function inicializarMapaContacto() {
  // Evita inicializar más de una vez si usas SPA o recargas parciales
  if (window._mapaContactoIniciado) return;
  window._mapaContactoIniciado = true;

  // Coordenadas de tu ubicación (Madrid)
  const coordenadas = [40.344257, -3.706111];
  const mapa = L.map('mi-mapa').setView(coordenadas, 17);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);

  L.marker(coordenadas).addTo(mapa)
    .bindPopup('P.º de Alberto Palacios, 2<br>Madrid')
    .openPopup();
}
