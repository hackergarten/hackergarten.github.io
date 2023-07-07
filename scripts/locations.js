$(document).ready(function () {
    var map = L.map("map");
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    var markers = locations.map((location) =>
        L.marker([location.lat, location.lon]).bindPopup(
            '<div class="location-popup">' +
            '<p class="location-marker">' + location.title + '</p>' +
            '<p class="location-sponsors">sponsored by ' + location.sponsors.join(', ') + '</p>' +
            '<p class="location-meetup"><a href="' + location.link + '"><img src="../pictures/meetup.svg" alt=""> Meetup group</p>' +
            '</div>'
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
        title: "Hackergarten Zürich",
        sponsors: ["Quatico Solutions AG"],
        link: "https://www.meetup.com/hackergarten-zurich/",
        lat: 47.3925495,
        lon: 8.507826793619888,
    },
    {
        title: "Hackergarten Stuttgart",
        sponsors: ["codecentric AG"],
        link: "https://www.meetup.com/de-DE/hackergarten-stuttgart/",
        lat: 48.72592,
        lon: 9.1144,
    },
    {
        title: "Hackergarten Luzern",
        sponsors: ["CSS Versicherung"],
        link: "https://www.meetup.com/hackergarten-luzern/",
        lat: 47.0435895,
        lon: 8.315118,
    },
    {
        title: "Hackergarten Basel",
        sponsors: ["Karakun AG"],
        link: "https://www.meetup.com/hackergarten-basel/",
        lat: 47.5487602,
        lon: 7.5879349,
    },
];
