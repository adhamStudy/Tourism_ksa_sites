// api.js
import axios from "axios";
import { config } from "./config";

export const fetchSites = async () => {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/get_data/sites_with_icon`, {
      headers: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhc21hQGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzc1OTU5ODI3fQ.uL8bj0aLylRZB--4VswjibzgtuZY-_dKJEckVvWO4pg",
        "x-api-key": "MurShid999.GIS.AI333"
      }
    });

    console.log("📦 Sites Response:", response.data);
    const features = response.data.features || [];
    return features;
  } catch (error) {
    console.error("❌ Error fetching sites:", error.response?.data || error.message);
    return [];
  }
};

export const fetchCities = async () => {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/get_data/cities_with_icon`, {
      headers: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhc21hQGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzc1OTU5ODI3fQ.uL8bj0aLylRZB--4VswjibzgtuZY-_dKJEckVvWO4pg",
        "x-api-key": "MurShid999.GIS.AI333"
      }
    });

    console.log("🌍 Cities Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching cities:", error.response?.data || error.message);
    return { features: [] };
  }
};