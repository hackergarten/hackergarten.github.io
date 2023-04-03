$(document).ready(function () {
    var map = L.map("map");
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    var markers = locations.map((location) =>
        L.marker([location.lat, location.lon]).bindPopup(
            '<span class="location-marker">' + location.venue + "</span>"
        )
    );
    markers.forEach((marker) => {
        marker.addTo(map);
    });

    var group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds());
});

var locations = [
    {
        venue: "Quatico Solutions AG",
        lat: 47.3925495,
        lon: 8.507826793619888,
    },
    {
        venue: "codecentric AG",
        lat: 48.72592,
        lon: 9.1144,
    },
    {
        venue: "CSS Versicherung",
        lat: 47.0435895,
        lon: 8.315118,
    },
    {
        venue: "Karakun AG",
        lat: 47.5487602,
        lon: 7.5879349,
    },
];
