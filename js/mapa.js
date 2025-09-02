// Inicializar mapa
var map = L.map('mapa').setView([-37.997794, -57.548122], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Grupo de marcadores
let markersLayer = L.layerGroup().addTo(map);

// Icono personalizado
const placeIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2288/2288494.png', // reemplazá por tu icono
  iconSize: [18, 18],
  iconAnchor: [16, 32]
});

// Función para mostrar establecimientos en el mapa
function mostrarEnMapa(establishments) {
  markersLayer.clearLayers();

  establishments.forEach(est => {
    if (est.latitud && est.longitud) {
      const marker = L.marker([est.latitud, est.longitud], { icon: placeIcon });

      // cada marcador sabe su id
      marker.establecimientoId = est.id;

      // al hacer clic llamamos a mostrarDetalles
      marker.on('click', () => {
        mostrarDetalles(est.id);
      });

      markersLayer.addLayer(marker);
    }
  });

  // ajustar vista solo si hay marcadores
  if (markersLayer.getLayers().length > 0) {
    map.fitBounds(markersLayer.getBounds(), { padding: [50, 50] });
  }
}

// hacer la función accesible desde Establecimientos.js
window.mostrarEnMapa = mostrarEnMapa;
