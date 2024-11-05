$(document).ready(function () {
    $.getJSON("locations.json", function (data) {
        const locations = data;

        var map = L.map("map");
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        var markers = locations.map((location) =>
            L.marker([location.lat, location.long]).bindPopup(
                '<div class="location-popup">' +
                    '<p class="location-marker">' +
                    location.title +
                    "</p>" +
                    '<p class="location-sponsors">sponsored by ' +
                    location.sponsors.join(", ") +
                    "</p>" +
                    '<p class="location-meetup"><a href="' +
                    location.link +
                    '"><img src="../pictures/meetup.svg" alt=""> Meetup group</p>' +
                    "</div>"
            )
        );
        markers.forEach((marker) => {
            marker.addTo(map);
        });

        var group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds());
    });
});
