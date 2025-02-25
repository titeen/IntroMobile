"use dom";

import { useEffect, useState } from "react";
import { fetchSightings, UfoSighting } from "../services/api";

const SightingList = () => {
  const [sightings, setSightings] = useState<UfoSighting[]>([]);

  useEffect(() => {
    const loadSightings = async () => {
      const data = await fetchSightings();
      setSightings(data);
    };
    loadSightings();
  }, []);

  return (
    <div style={{ padding: "20px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <h2>UFO Sightings</h2>

      <div style={{
        overflowY: "auto",
        flexGrow: 1,
        border: "1px solid #ccc",
        padding: "10px",
        maxHeight: "70vh" 
      }}>
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {sightings.map((sighting) => (
            <li key={sighting.id} style={{ 
              borderBottom: "1px solid #ccc", 
              padding: "10px 0", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px" 
            }}>
              <img src={sighting.picture} alt="UFO" style={{ width: "80px", height: "80px", borderRadius: "8px" }} />
              <div>
                <strong>{sighting.witnessName}</strong>
                <p>{sighting.description}</p>
                <p><i>Status: {sighting.status}</i></p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SightingList;
