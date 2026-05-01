// Crear mapa
const map = L.map('map', {
  zoomControl: false
}).setView([20, 0], 2);

// Fondo oscuro
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap & CartoDB',
    subdomains: 'abcd',
    maxZoom: 19
  }
).addTo(map);

// Zoom abajo derecha
L.control.zoom({
  position: 'bottomright'
}).addTo(map);

// Cargar países
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
  .then(res => res.json())
  .then(data => {

    // ❌ NO incluir USA acá
    const visitedCountries = [
      "Brazil",
      "Uruguay",
      "Chile",
      "Spain",
      "Croatia",
      "Dominican Republic",
      "Italy"
    ];

    const homeCountry = "Argentina";

    const flags = {
      "Argentina": "ar",
      "Brazil": "br",
      "Uruguay": "uy",
      "Chile": "cl",
      "Spain": "es",
      "Croatia": "hr",
      "Dominican Republic": "do",
      "United States of America": "us",
      "Italy": "it"
    };

    // 🎨 estilos
    function style(feature) {
      const name = feature.properties.name;

      if (name === homeCountry) {
        return {
          fillColor: "#ef4444",
          weight: 2,
          color: "#b91c1c",
          fillOpacity: 0.7
        };
      }

      if (visitedCountries.includes(name)) {
        return {
          fillColor: "#22c55e",
          weight: 1,
          color: "#16a34a",
          fillOpacity: 0.6
        };
      }

      return {
        fillColor: "#1e293b",
        weight: 0.5,
        color: "#334155",
        fillOpacity: 0.3
      };
    }

    // 🖱️ popups
    function onEachFeature(feature, layer) {
      const name = feature.properties.name;
      const flagCode = flags[name];

      let content = "";

      if (name === homeCountry) {
        content = `
          <div style="text-align:center">
            <img src="https://flagcdn.com/w80/${flagCode}.png" width="50"/><br/>
            <strong>${name}</strong><br/>
            Vive aquí 🏠
          </div>
        `;
      } else if (visitedCountries.includes(name)) {
        content = `
          <div style="text-align:center">
            <img src="https://flagcdn.com/w80/${flagCode}.png" width="50"/><br/>
            <strong>${name}</strong><br/>
            Xownz estuvo aquí ✅
          </div>
        `;
      }

      if (content) {
        layer.bindPopup(content);
      }

      layer.on('click', function () {
        map.fitBounds(layer.getBounds(), {
          padding: [20, 20],
          maxZoom: 6
        });
      });
    }

    // 🌍 mapa base
    L.geoJSON(data, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    // 🇺🇸 SOLO USA CONTINENTAL
    const usaFeature = data.features.find(
      f => f.properties.name === "United States of America"
    );

    if (usaFeature) {

      // filtrar solo el continental por ubicación
      const mainland = usaFeature.geometry.coordinates.filter(polygon => {
        const [lng, lat] = polygon[0][0];

        return (
          lat > 24 && lat < 50 &&   // rango vertical USA continental
          lng > -125 && lng < -66   // rango horizontal
        );
      });

      // dibujar encima en verde
      L.geoJSON({
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: mainland
        }
      }, {
        style: {
          fillColor: "#22c55e",
          color: "#16a34a",
          weight: 1,
          fillOpacity: 0.6
        }
      }).addTo(map);
    }

  })
  .catch(err => console.error(err));
