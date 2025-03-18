import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { fetchSightings, UfoSighting } from "../services/api";
import { eventEmitter } from "../app/(tabs)/list";
import { useTheme } from "../services/themeContext";
import { View } from "react-native";
import ThemeToggle from "./themeToggle";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const UFO_ICON = L.icon({
  iconUrl: "https://raw.githubusercontent.com/similonap/public_icons/main/ufo.png",
  iconSize: [40, 40],
  popupAnchor: [0, -20],
});

// Reverse geocoding function with OpenStreetMap Nominatim
const getLocationName = async (latitude: number, longitude: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en-US`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.display_name) {
      return data.display_name; 
    }
  } catch (error) {
    console.error("Error fetching location name:", error);
  }
  return "Location unknown";
};

const UFOMap = () => {
  const [sightings, setSightings] = useState<UfoSighting[]>([]);
  const [locationNames, setLocationNames] = useState<Map<number, string>>(new Map());
  const [loadingLocation, setLoadingLocation] = useState<Map<number, boolean>>(new Map());
  const { isDarkMode, theme } = useTheme();
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const loadSightings = async () => {
    const data = await fetchSightings();
    setSightings(data);

    const tempLocationNames = new Map<number, string>();  

    // Loop through each sighting and fetch the location
    for (const sighting of data) {
      setLoadingLocation((prev) => new Map(prev).set(sighting.id, true)); 
      const name = await getLocationName(sighting.location.latitude, sighting.location.longitude);
      tempLocationNames.set(sighting.id, name);
      setLoadingLocation((prev) => new Map(prev).set(sighting.id, false));
    }

    setLocationNames(tempLocationNames);

  };
  const refreshAllData = async () => {
    console.log("Refreshing all map data...");
    setSightings([]);  
    setLocationNames(new Map());  
    setLoadingLocation(new Map()); 
    await loadSightings(); 
  };

  useEffect(() => {
  loadSightings();

  const newSightingListener = eventEmitter.addListener("newSightingAdded", async (newSighting) => {
    console.log("Map received new sighting:", newSighting);
    setSightings((prevSightings) => [newSighting, ...prevSightings]);
    setLoadingLocation((prev) => new Map(prev).set(newSighting.id, true));

    const name = await getLocationName(newSighting.location.latitude, newSighting.location.longitude);
    setLocationNames((prev) => new Map(prev).set(newSighting.id, name));
    setLoadingLocation((prev) => new Map(prev).set(newSighting.id, false));
  });

  const deletionListener = eventEmitter.addListener("sightingDeleted", (id) => {
    console.log("Map received deletion event for sighting ID:", id);
    
    setSightings((prevSightings) => {
      const updated = prevSightings.filter(sighting => sighting.id !== id);
      console.log(`After filtering: from ${prevSightings.length} to ${updated.length} sightings`);
      return updated;
    });

    setLocationNames((prev) => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
    
    setLoadingLocation((prev) => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  });

  return () => {
    newSightingListener.remove();
    deletionListener.remove();
  };
}, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <button 
      onClick={refreshAllData}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        padding: "8px 12px",
        backgroundColor: theme.colors.primary,
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.2)"
      }}
    >
      <span style={{ display: "inline-flex" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4v6h6"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      </span>
      Refresh Map
    </button>
      <MapContainer 
        center={[51.2243, 4.3852]} 
        zoom={6} 
        minZoom={3} 
        maxZoom={18} 
        worldCopyJump={false} 
        maxBounds={[
          [-85, -180], 
          [85, 180],   
        ]}
        maxBoundsViscosity={1.0} 
        style={{ width: "100%", height: "calc(100vh - 120px)" }}
      >
        <TileLayer url={tileUrl} />
        {sightings.map((sighting) => {
          const locationName = locationNames.get(sighting.id) || "Loading location";
          const isConfirmed = sighting.status && sighting.status.toLowerCase() === "confirmed";
          
          
          return (
            <Marker
              key={sighting.id}
              position={[sighting.location.latitude, sighting.location.longitude]}
              icon={UFO_ICON}
            >
              <Popup>
                <div style={{ 
                  textAlign: "center", 
                  backgroundColor: isDarkMode ? "#2d2d2d" : "white",
                  color: isDarkMode ? "white" : "black",
                  padding: "10px",
                  borderRadius: "5px"
                }}>
                  <img src={sighting.picture} alt="UFO" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
                  <p><strong>{sighting.witnessName}</strong></p>
                  <p>{sighting.description}</p>
                  <p style={{ 
                    backgroundColor: isConfirmed ? 
                      (isDarkMode ? "#1e3a2f" : "#e6f4ea") : 
                      (isDarkMode ? "#3a2f1e" : "#fff8e6"),
                    padding: "5px",
                    borderRadius: "5px",
                    color: isConfirmed ? 
                      (isDarkMode ? "#4caf50" : "#0d652d") : 
                      (isDarkMode ? "#ffc107" : "#b06000"),
                    display: "inline-block",
                    fontWeight: "bold"
                  }}>
                    Status: {sighting.status}
                  </p>
                  <p><b>Date: {formatDate(sighting.dateTime)}</b></p>
                  <p><b>Contact: {sighting.witnessContact}</b></p>
                  <p><b>Location: {locationName}</b></p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default UFOMap;