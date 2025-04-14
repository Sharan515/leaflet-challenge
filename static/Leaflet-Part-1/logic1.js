// USGS GeoJSON URL - Past 7 Days, All Earthquakes
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Color scale based on depth
function getColor(depth) {
  return depth > 90 ? "#ff0000" :      // red
         depth > 70 ? "#ff9933" :      // orange
         depth > 50 ? "#ffff33" :      // yellow
         depth > 30 ? "#ccff33" :      // yellow-green
         depth > 10 ? "#66ff33" :      // lime green
                      "#99ff66";       // light green
}

// Radius based on magnitude
function getRadius(magnitude) {
  return magnitude === 0 ? 1 : magnitude * 4;
}

// Create the map
let map = L.map("map").setView([37.09, -95.71], 4);

// Add tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Load GeoJSON data
d3.json(url).then(data => {
  L.geoJson(data, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng);
    },
    style: feature => ({
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]), // depth
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    }),
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        `<strong>Location:</strong> ${feature.properties.place}<br>` +
        `<strong>Magnitude:</strong> ${feature.properties.mag}<br>` +
        `<strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
      );
    }
  }).addTo(map);

  // Add legend
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70, 90];
    
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        `<i style="background:${getColor(depths[i] + 1)}"></i> ` +
        `${depths[i]}${depths[i + 1] ? `–${depths[i + 1]}<br>` : "+"}`;
    }
    return div;
  };
  

  legend.addTo(map);
});
