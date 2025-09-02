const map = L.map("mapa").setView([-38.00042, -57.5562], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

const markers = {};

const customIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4812/4812047.png",
    iconSize: [25, 25],
    iconAnchor: [20, 40]
});

function addEstablecimientoMarker(est) {
    if (!est.latitud || !est.longitud) return;

    const marker = L.marker([est.latitud, est.longitud], { icon: customIcon }).addTo(map);

    markers[est.id] = marker;

    marker.on("click", () => {
      map.setView(marker.getLatLng(), 20);
        if (typeof mostrarDetalleEstablecimiento === "function") {
            mostrarDetalleEstablecimiento(est);
        }
    });
}

function focusOnMarker(idEstablecimiento) {
    const marker = markers[idEstablecimiento];
    if (marker) {
        map.setView(marker.getLatLng(), 20);
        marker.openPopup();
    }
}

window.addEstablecimientoMarker = addEstablecimientoMarker;
window.focusOnMarker = focusOnMarker;