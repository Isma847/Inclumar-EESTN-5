console.log("🗺️ Cargando mapa.js...");

if (typeof L === "undefined") {
  console.error("Leaflet no está cargado");
} else {
  console.log("✅ Leaflet disponible");
}

let map = null;
let markersLayer = null;

const MAR_DEL_PLATA_CENTER = [-37.997794, -57.548122];
const MAR_DEL_PLATA_BOUNDS = [
  [-38.1, -57.7],
  [-37.8, -57.4],
];

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(initializarMapa, 500);
});

function initializarMapa() {
  try {
    console.log("🗺️ Inicializando mapa centrado en Mar del Plata...");

    map = L.map("mapa").setView(MAR_DEL_PLATA_CENTER, 15);

    map.setMinZoom(1);
    map.setMaxZoom(19);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    console.log("✅ Mapa inicializado correctamente en Mar del Plata");

    window.mostrarEnMapa = mostrarEnMapa;
  } catch (error) {
    console.error("❌ Error al inicializar mapa:", error);

    window.mostrarEnMapa = function (establishments) {
      console.log(
        "Mapa no disponible, pero recibidos",
        establishments?.length || 0,
        "establecimientos"
      );
    };
  }
}

const placeIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2288/2288494.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

let esCargaInicial = true;

// Función para mostrar establecimientos en el mapa
function mostrarEnMapa(establishments) {
  console.log(
    "📍 Mostrando en mapa:",
    establishments?.length || 0,
    "establecimientos"
  );

  if (!map || !markersLayer) {
    console.warn("⚠️ Mapa no inicializado, intentando reinicializar...");
    initializarMapa();
    return;
  }

  try {
    markersLayer.clearLayers();

    if (!establishments || establishments.length === 0) {
      console.log("📍 No hay establecimientos para mostrar");

      map.setView(MAR_DEL_PLATA_CENTER, 15);
      return;
    }

    let validMarkers = 0;
    let todosLosMarcadores = [];

    establishments.forEach((est) => {
      if (
        est.latitud &&
        est.longitud &&
        !isNaN(est.latitud) &&
        !isNaN(est.longitud)
      ) {
        try {
          const marker = L.marker([est.latitud, est.longitud], {
            icon: placeIcon,
          });

          const popupContent = `
                        <div style="min-width: 200px;">
                            <h3 style="margin: 0 0 8px 0; color: #333;">${
                              est.nombre || "Sin nombre"
                            }</h3>
                            <p style="margin: 0 0 4px 0; color: #666;"><strong>Tipo:</strong> ${
                              est.TipoDeEstablecimiento || "Sin categoría"
                            }</p>
                            <p style="margin: 0 0 8px 0; color: #666;"><strong>Ubicación:</strong> ${
                              est.ubicacion || "Sin dirección"
                            }</p>
                            ${
                              est.calificacion
                                ? `<p style="margin: 0; color: #7EA4EB;"><strong>⭐ ${est.calificacion}/5</strong></p>`
                                : ""
                            }
                            <button onclick="mostrarDetalles('${
                              est.id
                            }')" style="margin-top: 8px; padding: 6px 12px; background: #7EA4EB; color: white; border: none; border-radius: 4px; cursor: pointer;">Ver detalles</button>
                        </div>
                    `;

          marker.bindPopup(popupContent);

          marker.establecimientoId = est.id;

          markersLayer.addLayer(marker);
          todosLosMarcadores.push(marker);
          validMarkers++;
        } catch (markerError) {
          console.warn(
            "Error al crear marcador para:",
            est.nombre,
            markerError
          );
        }
      }
    });

    console.log(`✅ Agregados ${validMarkers} marcadores al mapa`);

    if (validMarkers > 0) {
      try {
        if (esCargaInicial) {
          console.log("📍 Carga inicial: centrando en Mar del Plata");
          map.setView(MAR_DEL_PLATA_CENTER, 14);
          esCargaInicial = false;
        } else {
          console.log("Filtro aplicado: ajustando vista a resultados");

          if (validMarkers === 1) {
            const marker = todosLosMarcadores[0];
            const latLng = marker.getLatLng();
            map.setView([latLng.lat, latLng.lng], 16);
          } else {
            const group = new L.featureGroup(todosLosMarcadores);
            map.fitBounds(group.getBounds(), {
              padding: [30, 30],
              maxZoom: 17,
            });
          }
        }
      } catch (boundsError) {
        console.warn("No se pudo ajustar vista del mapa:", boundsError);

        map.setView(MAR_DEL_PLATA_CENTER, 14);
      }
    } else {
      console.log("No hay marcadores válidos, manteniendo vista centrada");
      map.setView(MAR_DEL_PLATA_CENTER, 14);
    }
  } catch (error) {
    console.error("Error al mostrar establecimientos en mapa:", error);
  }
}

// Función para centrar el mapa en un establecimiento específico
function centrarEnEstablecimiento(establecimiento) {
  if (!map) return;

  if (establecimiento.latitud && establecimiento.longitud) {
    map.setView([establecimiento.latitud, establecimiento.longitud], 17);

    markersLayer.eachLayer((layer) => {
      if (layer.establecimientoId === establecimiento.id) {
        layer.openPopup();
      }
    });
  }
}

// Hacer funciones disponibles globalmente
window.centrarEnEstablecimiento = centrarEnEstablecimiento;
window.debugMapa = debugMapa;

// Verificar inicialización después de un momento
setTimeout(() => {
  if (typeof window.mostrarEnMapa === "function") {
    console.log("mapa.js cargado correctamente - Centrado en Mar del Plata");
  } else {
    console.error("mostrarEnMapa no está disponible");
  }
}, 1000);

console.log("mapa.js procesado - Configurado para Mar del Plata");
