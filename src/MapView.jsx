import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import axios from "axios";

const getCityImage = (cityName) => {
  const city = cityName.toLowerCase();
  if (city.includes("الرياض") || city.includes("riyadh")) {
    return "https://raw.githubusercontent.com/Murshid-gis-ai/icone-pecture/main/icone/icone%20of%20the%20cities/Riyadh.png";
  }
  if (city.includes("جدة") || city.includes("jeddah")) {
    return "https://raw.githubusercontent.com/Murshid-gis-ai/icone-pecture/main/icone/icone%20of%20the%20cities/Jeddah.png";
  }
  if (city.includes("العلا") || city.includes("alula")) {
    return "https://raw.githubusercontent.com/Murshid-gis-ai/icone-pecture/main/icone/icone%20of%20the%20cities/Alula.png";
  }
  if (city.includes("المدينة") || city.includes("madinah")) {
    return "https://raw.githubusercontent.com/Murshid-gis-ai/icone-pecture/main/icone/icone%20of%20the%20cities/Almadinah.png";
  }
  return "https://raw.githubusercontent.com/Murshid-gis-ai/icone-pecture/main/icone/icone%20of%20the%20cities/Riyadh.png";
};

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      const leafletMap = L.map(mapRef.current).setView([24.7136, 46.6753], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMap);

      mapInstance.current = leafletMap;
    }

    const fetchSites = async () => {
      try {
        const response = await axios.get(
          "https://murshidgis.duckdns.org/get_data/sites",
          {
            headers: {
              token:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhc21hQGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzc1OTU5ODI3fQ.uL8bj0aLylRZB--4VswjibzgtuZY-_dKJEckVvWO4pg",
              "x-api-key": "MurShid999.GIS.AI333",
            },
          }
        );

        console.log("📦 بيانات المواقع:", response.data.data);
        setSites(response.data.data);
      } catch (error) {
        console.error(
          "❌ خطأ في جلب المواقع:",
          error.response?.data || error.message
        );
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    if (sites.length > 0 && mapInstance.current) {
      sites.forEach((site) => {
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background-image: url(${getCityImage(
            site.city
          )}); width: 50px; height: 50px; background-size: cover; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
          iconSize: [50, 50],
        });

        const popup = L.popup().setContent(
          `<h3>${site.name}</h3><p>${site.description}</p>`
        );

        L.marker([site.latitude, site.longitude], { icon })
          .bindPopup(popup)
          .addTo(mapInstance.current);
      });
    }
  }, [sites]);

  return (
    <div
      ref={mapRef}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
};

export default MapView;
