if (typeof mapCoordinates === "string") {
    mapCoordinates = JSON.parse(mapCoordinates);
}

// Marker icon change
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],    // size of the icon
    iconAnchor: [12, 41],  // point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
    shadowSize: [41, 41]   // size of the shadow
});

// Swap order to [lat, lng]
const coordinates = [mapCoordinates[1], mapCoordinates[0]];

const map = L.map('map').setView(coordinates, 9);
const layer = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapToken}`, {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
    crossOrigin: true
}).addTo(map);


const marker = L.marker(coordinates, {icon: redIcon}).addTo(map);

marker.bindPopup(`<h4>${Address}</h4><p>Exact location will be provided after booking</p>`);
