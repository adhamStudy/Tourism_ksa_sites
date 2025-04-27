import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { fetchSites, fetchCities } from "./api";
import { config } from "./config";
import "leaflet/dist/leaflet.css";
import { useNavigate, useLocation } from "react-router-dom";

// Map zoom toggle component
const ZoomToggle = ({ setShowSites }) => {
  const map = useMap();
  useEffect(() => {
    const handleZoom = () => {
      setShowSites(map.getZoom() >= 8);
    };
    map.on("zoomend", handleZoom);
    handleZoom();
    return () => map.off("zoomend", handleZoom);
  }, [map, setShowSites]);
  return null;
};

// Component to center the map on search
const CenterMap = ({ position, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      // Add a slight delay to ensure smooth centering
      const timer = setTimeout(() => {
        // Use flyTo instead of setView for smoother animation
        map.flyTo(position, zoom || 12, {
          animate: true,
          duration: 1, // 1 second animation
          easeLinearity: 0.5,
          // Set padding options to center the marker better
          padding: [50, 50, 50, 50],
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [position, zoom, map]);

  return null;
};

const ReactLeafletMap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCityName = location.state?.selectedCity;

  const [sites, setSites] = useState([]);
  const [cities, setCities] = useState([]);
  const [events, setEvents] = useState([]);
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSites, setShowSites] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [centerPosition, setCenterPosition] = useState(null);
  const [mapZoom, setMapZoom] = useState(5);
  const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);
  const searchRef = useRef(null);
  const userEmail = localStorage.getItem("userEmail") || "user@murshid.com";

  // Add this state for the selected site
  const [selectedSite, setSelectedSite] = useState(null);

  // Add this useEffect for handling city selection from homepage
  useEffect(() => {
    if (!selectedCityName || cities.length === 0 || isLoading) return;

    // Make the matching case-insensitive and handle potential name variations
    const normalizedSearchName = selectedCityName.toLowerCase().trim();

    // Try different name variations
    const possibleNames = [
      normalizedSearchName,
      normalizedSearchName === "madinah" ? "medina" : normalizedSearchName,
      normalizedSearchName === "medina" ? "madinah" : normalizedSearchName,
      normalizedSearchName === "alula" ? "al ula" : normalizedSearchName,
      normalizedSearchName === "al ula" ? "alula" : normalizedSearchName,
      normalizedSearchName === "madinah" ? "al madinah" : normalizedSearchName,
      normalizedSearchName === "al madinah" ? "madinah" : normalizedSearchName,
    ];

    // Find city with any of the possible name variations
    const city = cities.find((city) => {
      const cityName = city.properties.name.toLowerCase().trim();
      return possibleNames.includes(cityName);
    });

    if (city) {
      console.log(
        `Found city match for ${selectedCityName}:`,
        city.properties.name
      );
      const coords = city.geometry?.coordinates;
      if (!coords) return;

      // Small delay to ensure map is fully loaded
      setTimeout(() => {
        setCenterPosition([coords[1], coords[0]]);
        setMapZoom(12);
        setSelectedCity(city);
        setSearchText(city.properties.name);
      }, 500);
    } else {
      console.log(
        `No city match found for ${selectedCityName}. Available cities:`,
        cities.map((c) => c.properties.name)
      );
    }
  }, [selectedCityName, cities, isLoading]);

  // Handle outside click for search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-dismiss the not found message
  useEffect(() => {
    let timer;
    if (showNotFoundMessage) {
      timer = setTimeout(() => {
        setShowNotFoundMessage(false);
      }, 3000); // Dismiss after 3 seconds
    }
    return () => clearTimeout(timer);
  }, [showNotFoundMessage]);

  // Enhanced search function for cities and sites
  const handleSearch = useCallback(
    (query) => {
      setSearchText(query);
      setShowNotFoundMessage(false);

      if (!query.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      const normalizedQuery = query.toLowerCase().trim();

      // Search in cities
      const filteredCities = cities.filter((city) =>
        city.properties.name.toLowerCase().includes(normalizedQuery)
      );

      // Search in sites
      const filteredSites = sites.filter(
        (site) =>
          site.properties.name &&
          site.properties.name.toLowerCase().includes(normalizedQuery)
      );

      // Combine results with type identifier
      const combinedResults = [
        ...filteredCities.map((city) => ({
          type: "city",
          name: city.properties.name,
          data: city,
        })),
        ...filteredSites.map((site) => ({
          type: "site",
          name: site.properties.name,
          data: site,
        })),
      ];

      setSearchResults(combinedResults);
      setShowSearchResults(combinedResults.length > 0);
    },
    [cities, sites]
  );

  // Enhanced search submission handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (!searchText.trim()) return;

    const normalizedQuery = searchText.toLowerCase().trim();

    // First try to find exact match in cities
    const matchingCity = cities.find(
      (city) => city.properties.name.toLowerCase() === normalizedQuery
    );

    if (matchingCity) {
      handleSelectCity(matchingCity);
      return;
    }

    // Then try to find exact match in sites
    const matchingSite = sites.find(
      (site) =>
        site.properties.name &&
        site.properties.name.toLowerCase() === normalizedQuery
    );

    if (matchingSite) {
      handleSelectSite(matchingSite);
      return;
    }

    // If no exact match, try partial matches
    const partialMatchCity = cities.find((city) =>
      city.properties.name.toLowerCase().includes(normalizedQuery)
    );

    if (partialMatchCity) {
      handleSelectCity(partialMatchCity);
      return;
    }

    const partialMatchSite = sites.find(
      (site) =>
        site.properties.name &&
        site.properties.name.toLowerCase().includes(normalizedQuery)
    );

    if (partialMatchSite) {
      handleSelectSite(partialMatchSite);
      return;
    }

    // If nothing found, show not found message
    setShowNotFoundMessage(true);
    setShowSearchResults(false);
  };

  // Function to handle site selection
  const handleSelectSite = useCallback(
    (site) => {
      const coords = site.geometry?.coordinates;
      if (!coords) return;

      // Ensure coordinates are properly extracted and ordered correctly (Leaflet expects [lat, lng])
      const centerPoint = [parseFloat(coords[1]), parseFloat(coords[0])];

      // Set these coordinates directly
      setCenterPosition(centerPoint);
      setMapZoom(15); // Higher zoom for sites
      setSelectedSite(site);
      setShowSearchResults(false);
      setSearchText(site.properties.name);

      // Find the city that contains this site (optional)
      const containingCity = cities.find((city) => {
        if (!city.properties.id || !site.properties.city_id) return false;
        return city.properties.id === site.properties.city_id;
      });

      if (containingCity) {
        setSelectedCity(containingCity);
      } else {
        setSelectedCity(null);
      }
    },
    [cities]
  );

  // City selection function
  const handleSelectCity = useCallback((city) => {
    const coords = city.geometry?.coordinates;
    if (!coords) return;

    // Ensure coordinates are properly extracted and ordered correctly (Leaflet expects [lat, lng])
    const centerPoint = [parseFloat(coords[1]), parseFloat(coords[0])];

    // Set these coordinates directly without any manipulation
    setCenterPosition(centerPoint);
    setMapZoom(11); // Slightly less zoom to ensure the whole city is visible
    setSelectedCity(city);
    setShowSearchResults(false);
    setSearchText(city.properties.name);
    setSelectedSite(null); // Reset any selected site
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhc21hQGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzc1OTU5ODI3fQ.uL8bj0aLylRZB--4VswjibzgtuZY-_dKJEckVvWO4pg";
        const apiKey = "MurShid999.GIS.AI333";

        const sitesData = await fetchSites();
        const citiesData = await fetchCities();
        const eventsRes = await fetch(`${config.apiBaseUrl}/get_data/events`, {
          headers: { token, "x-api-key": apiKey },
        });
        const toursRes = await fetch(`${config.apiBaseUrl}/get_data/tours`, {
          headers: { token, "x-api-key": apiKey },
        });

        setEvents((await eventsRes.json()).features || []);
        setTours((await toursRes.json()).features || []);
        setSites(sitesData);
        setCities(citiesData.features || []);

        // Log all city names for debugging
        console.log(
          "Available cities in database:",
          (citiesData.features || []).map((city) => city.properties.name)
        );

        setIsLoading(false);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const renderSidePanels = () => {
    if (!selectedCity) return null;
    const props = selectedCity.properties;

    const relatedEvents = events.filter(
      (e) => e.properties.city_id === props.id
    );
    const relatedTours = tours.filter((t) => t.properties.city_id === props.id);

    return (
      <>
        {/* Tours Card */}
        <div className="popup-card left">
          <h3>🧭 Tours</h3>
          <ul>
            {relatedTours.length > 0 ? (
              relatedTours.map((tour, i) => (
                <li key={i}>
                  <strong>{tour.properties.title}</strong>
                  <br />
                  <span>{tour.properties.tour_schedule}</span>
                </li>
              ))
            ) : (
              <li>No tours available for this city</li>
            )}
          </ul>
        </div>

        {/* Events Card */}
        <div className="popup-card right">
          <h3>📅 Events</h3>
          <ul>
            {relatedEvents.length > 0 ? (
              relatedEvents.map((event, i) => (
                <li key={i}>
                  <strong>{event.properties.title}</strong>
                  <br />
                  <span>
                    {event.properties.start_date} to {event.properties.end_date}
                  </span>
                </li>
              ))
            ) : (
              <li>No events available for this city</li>
            )}
          </ul>
        </div>

        {/* City Info Card with ❌ */}
        <div className="city-info-card">
          <button className="close-btn" onClick={() => setSelectedCity(null)}>
            ❌
          </button>
          <div className="city-text">
            <h3>{props.name}</h3>
            <p>{props.description}</p>
          </div>
          <div className="city-image">
            <img src={props.image_url} alt={props.name} />
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner-box">
            <div className="circle-spinner" />
            <p>Loading tourist map...</p>
          </div>
        </div>
      )}

      {/* City not found notification */}
      {showNotFoundMessage && (
        <div className="city-not-found-notification">
          <div className="notification-content">
            <div className="notification-icon">🔍</div>
            <div className="notification-text">
              <p>"{searchText}" will be available soon!</p>
              <p className="subtext">We're constantly updating our database.</p>
            </div>
          </div>
        </div>
      )}

      {!selectedCity && (
        <>
          {/* 🔍 Search - Enhanced with city and site results */}
          <div className="search-bar-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search for cities, sites ..."
                className="search-bar"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                onClick={() =>
                  searchResults.length > 0 && setShowSearchResults(true)
                }
              />
              <button type="submit" className="search-icon">
                🔍
              </button>
            </form>

            {/* Enhanced search results dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map((result, index) => (
                  <div
                    key={`search-${index}`}
                    className="search-result-item"
                    onClick={() => {
                      if (result.type === "city") {
                        handleSelectCity(result.data);
                      } else {
                        handleSelectSite(result.data);
                      }
                    }}
                  >
                    <span className="result-icon">
                      {result.type === "city" ? "🏙️" : "📍"}
                    </span>
                    <span>{result.name}</span>
                    <span className="result-type">
                      {result.type === "city" ? "City" : "Site"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🌐 Translate Button */}
          <div className="translate-button">
            <img
              src="https://cdn-icons-png.flaticon.com/512/484/484582.png"
              alt="Translate"
            />
          </div>

          {/* 🔙 Back Button */}
          <div className="back-btn" onClick={() => navigate("/")}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 5L7 10L12 15"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* 👤 User Profile */}
          <div className="user-profile-container">
            <div
              className="user-avatar"
              onClick={() => setShowProfile(!showProfile)}
            >
              <span role="img" aria-label="user">
                👤
              </span>
            </div>

            {showProfile && (
              <div className="user-info-card">
                <h4>📨 {userEmail}</h4>
                <button
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <>
        <MapContainer
          center={[24.7136, 46.6753]}
          zoom={5}
          style={{ height: "100vh" }}
        >
          <ZoomToggle setShowSites={setShowSites} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Add the centering component */}
          {centerPosition && (
            <CenterMap position={centerPosition} zoom={mapZoom} />
          )}

          {/* City markers */}
          {!showSites &&
            cities.map((city, index) => {
              const coords = city.geometry?.coordinates;
              const props = city.properties;
              const iconUrl = props.city_marker_icon;
              if (!coords || !iconUrl) return null;

              return (
                <Marker
                  key={`city-${index}`}
                  position={[coords[1], coords[0]]}
                  icon={L.icon({
                    iconUrl,
                    iconSize: [60, 60],
                    iconAnchor: [30, 60],
                  })}
                  eventHandlers={{ click: () => setSelectedCity(city) }}
                />
              );
            })}

          {/* Enhanced site markers - updated to highlight selected site */}
          {(showSites || selectedSite) &&
            sites.map((site, index) => {
              const coords = site.geometry?.coordinates;
              const props = site.properties;
              const iconUrl = props.category_marker_icon;
              if (!coords || !iconUrl) return null;

              const isSelectedSite =
                selectedSite && selectedSite.properties.id === props.id;
              const iconSize = isSelectedSite ? [65, 65] : [50, 50];

              return (
                <Marker
                  key={`site-${index}`}
                  position={[coords[1], coords[0]]}
                  icon={L.icon({
                    iconUrl,
                    iconSize,
                    iconAnchor: [iconSize[0] / 2, iconSize[1]],
                    popupAnchor: [0, -iconSize[1]],
                  })}
                  eventHandlers={{
                    click: () => {
                      // Only set selectedSite if it's not already selected
                      if (!isSelectedSite) {
                        setSelectedSite(site);
                      }
                    },
                  }}
                >
                  <Popup maxWidth={300}>
                    <h3>{props.name}</h3>
                    <p>{props.description}</p>
                    {props.image_url && (
                      <img
                        src={props.image_url}
                        alt={props.name}
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          marginTop: "8px",
                        }}
                      />
                    )}
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </>

      {renderSidePanels()}

      <style>{`
  .popup-card {
    position: absolute;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: fadeSlideIn 0.6s ease both;
    z-index: 1000;
  }

  .popup-card.left {
    top: 20px;
    left: 20px;
    width: 200px;
    padding: 12px;
    font-size: 13px;
  }

  .popup-card.right {
    top: 20px;
    right: 20px;
    width: 200px;
    padding: 12px;
    font-size: 13px;
  }

  .city-info-card {
    position: absolute;
    bottom: 20px;
    left: 13%;
    transform: translateX(-20%);
    background: white;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
    width: 900px;
    min-height: 180px;
    z-index: 1000;
    animation: fadeSlideIn 0.6s ease both;
    gap: 20px;
  }

  .city-text {
    flex: 1.5;
    padding-right: 20px;
  }

  .city-text h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  .city-text p {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }

  .city-image {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }

  .city-image img {
    width: 220px;
    height: 190px;
    border-radius: 20px;
    object-fit: cover;
  }

  .close-btn {
    position: absolute;
    top: 5px;
    right: -5px;
    background: transparent;
    border: none;
    font-size: 13px;
    cursor: pointer;
    color: #e91e63;
  }

  .popup-card ul {
    padding-left: 16px;
  }

  .popup-card li {
    margin-bottom: 8px;
    font-size: 13px;
  }

  .spinner {
    border: 4px solid #eee;
    border-top: 4px solid #009688;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    margin: 0 auto 10px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .city-info-card {
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }

    .city-image img {
      width: 100%;
      margin-top: 10px;
    }
  }

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.spinner-box {
  background: white;
  border-radius: 16px;
  padding: 20px 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadeSlideIn 0.6s ease both;
}

.circle-spinner {
  width: 50px;
  height: 50px;
  border: 6px solid #e0e0e0;
  border-top-color: #00b894;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-box p {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-bar-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 30px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  width: 340px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  z-index: 1100;
}

.search-bar-container form {
  display: flex;
  width: 100%;
  align-items: center;
}

.search-bar {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  padding: 8px 0;
}

.search-icon {
  font-size: 18px;
  color: #666;
  background: transparent;
  border: none;
  cursor: pointer;
}

.translate-button {
  position: absolute;
  top: 20px;
  left: 100px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  backdrop-filter: blur(6px);
}

.translate-button img {
  width: 22px;
  height: 22px;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 50px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  z-index: 1100;
}

.back-btn:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.user-profile-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1100;
}

.user-info-card {
  position: absolute;
  top: 70px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-info-card h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.user-info-card button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.user-info-card button:hover {
  background-color: #d32f2f;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.9);
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #00b894;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  backdrop-filter: blur(6px);
  transition: transform 0.2s ease-in-out;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.translate-button:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.top-buttons-container {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1100;
}

/* Enhanced search results dropdown styles */
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  margin-top: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1200;
}

.search-result-item {
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.result-icon {
  margin-right: 10px;
  font-size: 18px;
}

.result-type {
  margin-left: auto;
  font-size: 12px;
  color: #777;
  background: #f0f0f0;
  padding: 3px 6px;
  border-radius: 4px;
}

/* City not found notification */
.city-not-found-notification {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.97);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 2000;
  animation: slideDown 0.4s ease forwards, fadeOut 0.5s ease 2.5s forwards;
  min-width: 300px;
  border-left: 4px solid #3498db;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.notification-icon {
  font-size: 24px;
  background: #e0f7fa;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0288d1;
}

.notification-text p {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.notification-text .subtext {
  font-size: 13px;
  color: #777;
  margin-top: 4px;
}

/* Site popup styles */
.site-popup-image {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 10px;
}

@keyframes slideDown {
  from { transform: translate(-50%, -20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; visibility: hidden; }
}
      `}</style>
    </div>
  );
};

export default ReactLeafletMap;
