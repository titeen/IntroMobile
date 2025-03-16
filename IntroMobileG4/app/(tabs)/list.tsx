"use dom";

import { useEffect, useState } from "react";
import { fetchSightings, UfoSighting } from "../../services/api";
import { useRouter } from "expo-router";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const eventEmitter = new EventEmitter();

const SightingList = () => {
  const [sightings, setSightings] = useState<UfoSighting[]>([]);
  const [localSightingIds, setLocalSightingIds] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadSightings();
    const listener = eventEmitter.addListener("newSightingAdded", async (newSighting) => {
      setSightings((prevSightings) => [newSighting, ...prevSightings]); 
      setLocalSightingIds(prev => [...prev, newSighting.id]);
    });

    return () => listener.remove(); 
  }, []);

  const loadSightings = async () => {
    try {
      const data = await fetchSightings();
      setSightings(data);

      // Ophalen van lokaal opgeslagen sightings
      const storedSightings = await AsyncStorage.getItem("sightings");
      if (storedSightings) {
        const localItems = JSON.parse(storedSightings);
        setLocalSightingIds(localItems.map((item: UfoSighting) => item.id));
      }
    } catch (error) {
      console.error("Error loading sightings:", error);
    }
  };

  const deleteSighting = async (id: number) => {
    try {
      // Verwijderen uit local storage
      const storedSightings = await AsyncStorage.getItem("sightings");
      if (storedSightings) {
        const localItems = JSON.parse(storedSightings);
        const updatedItems = localItems.filter((item: UfoSighting) => item.id !== id);
        await AsyncStorage.setItem("sightings", JSON.stringify(updatedItems));
      }

      // Verwijderen uit de lijst
      setSightings(sightings.filter(sighting => sighting.id !== id));
      setLocalSightingIds(localSightingIds.filter(localId => localId !== id));
    } catch (error) {
      console.error("Error deleting sighting:", error);
    }
  };

  return (
    <div style={{ padding: "20px", height: "100vh", display: "flex", flexDirection: "column" }}>
      <h2>UFO Sightings</h2>

      <div
        style={{
          overflowY: "auto",
          flexGrow: 1,
          border: "5px solid #0d0d0d",
          padding: "10px",
          maxHeight: "70vh",
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {sightings.map((sighting) => (
            <li
              key={sighting.id}
              style={{
                borderBottom: "1px solid #0d0d0d",
                padding: "10px 0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                onClick={() =>
                  router.push({
                    pathname: "/detail",
                    params: {
                      witnessName: sighting.witnessName,
                      picture: sighting.picture,
                      description: sighting.description,
                      status: sighting.status,
                      dateTime: sighting.dateTime,
                      witnessContact: sighting.witnessContact,
                      latitude: sighting.location.latitude, 
                      longitude: sighting.location.longitude, 
                    },
                  })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  flexGrow: 1,
                }}
              >
                <img
                  src={sighting.picture}
                  alt="UFO"
                  style={{ width: "50px", height: "50px", borderRadius: "8px" }}
                />
                <div>
                  <strong>{sighting.witnessName}</strong>
                  <p>{sighting.description}</p>
                </div>
              </div>

              {localSightingIds.includes(sighting.id) && (
                <TouchableOpacity
                  onPress={() => deleteSighting(sighting.id)}
                  style={{ padding: 10 }}
                >
                  <MaterialCommunityIcons name="trash-can" size={24} color="red" />
                </TouchableOpacity>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SightingList;
