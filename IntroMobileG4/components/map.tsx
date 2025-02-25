"use dom";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { fetchSightings, UfoSighting } from "../services/api";

const UFO_ICON = L.icon({
  iconUrl: "https://raw.githubusercontent.com/similonap/public_icons/main/ufo.png",
  iconSize: [40, 40],
  popupAnchor: [0, -20],
});

const UFOMap = () => {
  const [sightings, setSightings] = useState<UfoSighting[]>([]);

  useEffect(() => {
    const loadSightings = async () => {
      const data = await fetchSightings();
      setSightings(data);
    };
    loadSightings();
  }, []);

  return (
    <MapContainer center={[51.2243, 4.3852]} zoom={3} style={{ width: "100%", height: "100vh" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {sightings.map((sighting) => (
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
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default UFOMap;
