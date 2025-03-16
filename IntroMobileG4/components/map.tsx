import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { fetchSightings, UfoSighting } from "../services/api";

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

  useEffect(() => {
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
    loadSightings();
  }, []);

  return (
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
      style={{ width: "100%", height: "100vh" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {sightings.map((sighting) => {
        const locationName = locationNames.get(sighting.id) || "Loading location";
        return (
          <Marker
            key={sighting.id}
            position={[sighting.location.latitude, sighting.location.longitude]}
            icon={UFO_ICON}
          >
            <Popup>
              <div style={{ textAlign: "center" }}>
                <img src={sighting.picture} alt="UFO" style={{ width: "100px", height: "100px" }} />
                <p><strong>{sighting.witnessName}</strong></p>
                <p>{sighting.description}</p>
                <p><i>Status: {sighting.status}</i></p>
                <p><b>Date: {formatDate(sighting.dateTime)}</b></p>
                <p><b>Contact: {sighting.witnessContact}</b></p>
                <p><b>Location: {locationName}</b></p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
  
};

export default UFOMap;