// Define base layers
let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicm9zYXpodSIsImEiOiJja2ZvbTFvbzEyM2c1MnVwbTFjdmVycXk5In0.71jVP2vD8pBWO2bsKtI48Q', {
    attribution: "© Mapbox",
    tileSize: 512,
    zoomOffset: -1
});

let grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicm9zYXpodSIsImEiOiJja2ZvbTFvbzEyM2c1MnVwbTFjdmVycXk5In0.71jVP2vD8pBWO2bsKtI48Q', {
    attribution: "© Mapbox",
    tileSize: 512,
    zoomOffset: -1
});

let outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicm9zYXpodSIsImEiOiJja2ZvbTFvbzEyM2c1MnVwbTFjdmVycXk5In0.71jVP2vD8pBWO2bsKtI48Q', {
    attribution: "© Mapbox",
    tileSize: 512,
    zoomOffset: -1
});

// Create map
let map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    layers: [satellite]
});

// Base layers object
let baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

// Overlay groups
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Add layer control
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Load Earthquake GeoJSON
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Depth color function
function getColor(depth) {
    return depth > 90 ? "#ea2c2c" :
           depth > 70 ? "#ea822c" :
           depth > 50 ? "#ee9c00" :
           depth > 30 ? "#eecc00" :
           depth > 10 ? "#d4ee00" :
                        "#98ee00";
}

// Radius based on magnitude
function getRadius(mag) {
    return mag === 0 ? 1 : mag * 4;
}

// Create earthquake layer
d3.json(earthquakeUrl).then(data => {
    L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng);
        },
        style: feature => ({
            color: "#000",
            weight: 0.5,
            fillColor: getColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.8,
            radius: getRadius(feature.properties.mag)
        }),
        onEachFeature: (feature, layer) => {
            layer.bindPopup(
                `Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}<br>Location: ${feature.properties.place}`
            );
        }
    }).addTo(earthquakes);

    earthquakes.addTo(map);
});

// Load tectonic plates GeoJSON from GitHub
let tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(tectonicUrl).then(data => {
    L.geoJSON(data, {
        color: "orange",
        weight: 2
    }).addTo(tectonicPlates);

    tectonicPlates.addTo(map);
});

// Add legend
let legend = L.control({position: "bottomright"});

legend.onAdd = function () {
    let div = L.DomUtil.create("div", "legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"];

    div.innerHTML = "<h4>Depth (km)</h4>";

    for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
            `<i style="background:${colors[i]}"></i> ${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+"}`;
    }

    return div;
};

legend.addTo(map);
