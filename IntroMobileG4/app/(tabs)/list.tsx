"use dom";

import { useEffect, useState } from "react";
import { fetchSightings, UfoSighting, deleteSighting as apiDeleteSighting } from "../../services/api";
import { useRouter } from "expo-router";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from "../../services/themeContext";
import { ActivityIndicator } from "react-native-paper";

export const eventEmitter = new EventEmitter();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const SightingList = () => {
  const [sightings, setSightings] = useState<UfoSighting[]>([]);
  const [localSightingIds, setLocalSightingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isDarkMode, theme } = useTheme();

  useEffect(() => {
    loadSightings();
  
    const newSightingListener = eventEmitter.addListener("newSightingAdded", async (newSighting) => {
      console.log("New sighting received in List:", newSighting);
      setSightings((prevSightings) => [newSighting, ...prevSightings]); 
      setLocalSightingIds(prev => [...prev, newSighting.id]);
    });

    const deletionListener = eventEmitter.addListener("sightingDeleted", (id) => {
      console.log("List received deletion event for sighting ID:", id);
      setSightings(prevSightings => prevSightings.filter(sighting => sighting.id !== id));
      setLocalSightingIds(prevIds => prevIds.filter(localId => localId !== id));
    });

    return () => {
      newSightingListener.remove();
      deletionListener.remove();
    }; 
  }, []);

  const loadSightings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSightings();
      setSightings(data);

      const storedSightings = await AsyncStorage.getItem("sightings");
      if (storedSightings) {
        const localItems = JSON.parse(storedSightings);
        setLocalSightingIds(localItems.map((item: UfoSighting) => item.id));
      }
    } catch (error) {
      console.error("Error loading sightings:", error);
      setError("Could not load sightings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSightingDelete = async (id: number) => {
    try {
      console.log("Attempting to delete sighting with ID:", id);
      await apiDeleteSighting(id);
      setSightings(prevSightings => {
        const updated = prevSightings.filter(sighting => sighting.id !== id);
        console.log(`Filtered sightings from ${prevSightings.length} to ${updated.length}`);
        return updated;
      });
      setLocalSightingIds(prevIds => prevIds.filter(localId => localId !== id));

      console.log("Emitting sightingDeleted event for ID:", id);
      eventEmitter.emit("sightingDeleted", id);
    } catch (error) {
      console.error("Error deleting sighting:", error);
    }
  };
    
  return (
    <div style={{ 
      padding: "20px", 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      transition: "background-color 0.3s ease, color 0.3s ease",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2 style={{ 
          margin: 0, 
          color: theme.colors.primary,
          fontFamily: "'Roboto', sans-serif",
          fontSize: "28px",
        }}>UFO Sightings</h2>
        <TouchableOpacity onPress={loadSightings} style={{ padding: 10 }}>
          <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </div>
      ) : error ? (
        <div style={{ 
          padding: "20px", 
          backgroundColor: isDarkMode ? "#331111" : "#ffdddd",
          color: isDarkMode ? "#ff8888" : "#cc0000",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <MaterialCommunityIcons name="alert-circle" size={32} color={isDarkMode ? "#ff8888" : "#cc0000"} />
          <p>{error}</p>
          <TouchableOpacity 
            onPress={loadSightings}
            style={{ 
              backgroundColor: theme.colors.primary, 
              padding: 8, 
              borderRadius: 4,
              marginTop: 10
            }}
          >
            <span style={{ color: "#ffffff" }}>Try Again</span>
          </TouchableOpacity>
        </div>
      ) : (
        <div
          style={{
            overflowY: "auto",
            flexGrow: 1,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "12px",
            padding: "10px",
            backgroundColor: theme.colors.surface,
            boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.1)",
          }}
>
          {sightings.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: isDarkMode ? "#888888" : "#666666" 
            }}>
              <MaterialCommunityIcons name="alien" size={48} color={isDarkMode ? "#888888" : "#666666"} />
              <p>No sightings available yet. Be the first to report one!</p>
            </div>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {sightings.map((sighting) => (
                <li
                  key={sighting.id}
                  style={{
                    borderBottom: `1px solid ${theme.colors.border}`,
                    padding: "16px",
                    margin: "8px 0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    backgroundColor: theme.colors.card,
                    borderRadius: "8px",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
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
                          latitude: sighting.location.latitude.toString(), 
                          longitude: sighting.location.longitude.toString(), 
                        },
                      })
                    }
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      cursor: "pointer",
                      flexGrow: 1,
                      color: theme.colors.text,
                    }}
                  >
                    <img
                      src={sighting.picture}
                      alt="UFO"
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        borderRadius: "8px",
                        objectFit: "cover",
                        border: `2px solid ${theme.colors.border}`
                      }}
                    />
                    <div>
                      <strong style={{ 
                        color: theme.colors.primary,
                        fontSize: "18px",
                        display: "block",
                        marginBottom: "4px"
                      }}>
                        {sighting.witnessName}
                      </strong>
                      <p style={{ 
                        marginTop: "2px", 
                        marginBottom: "8px",
                        color: theme.colors.text
                      }}>
                        {sighting.description.length > 100 
                          ? sighting.description.substring(0, 100) + "..." 
                          : sighting.description}
                      </p>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "16px",
                        fontSize: "14px",
                        color: isDarkMode ? "#aaaaaa" : "#666666"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <MaterialCommunityIcons name="calendar" size={16} color={isDarkMode ? "#aaaaaa" : "#666666"} />
                          <span>{formatDate(sighting.dateTime)}</span>
                        </div>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "4px",
                          backgroundColor: sighting.status.toLowerCase() === "confirmed" ? 
                            (isDarkMode ? "#1e3a2f" : "#e6f4ea") : 
                            (isDarkMode ? "#3a2f1e" : "#fff8e6"),
                          color: sighting.status.toLowerCase() === "confirmed" ? 
                            (isDarkMode ? "#4caf50" : "#0d652d") : 
                            (isDarkMode ? "#ffc107" : "#b06000")
                        }}>
                          <MaterialCommunityIcons
                            name={sighting.status.toLowerCase() === "confirmed" ? "check-circle" : "alert-circle"}
                            size={16}
                            color={sighting.status.toLowerCase() === "confirmed" ? "#4caf50" : "#ffc107"} 
                          />
                          <span style={{ 
                            color: sighting.status.toLowerCase() === "confirmed" ? "#4caf50" : "#ffc107" 
                          }}>
                            {sighting.status}
                          </span>

                        </div>
                      </div>
                    </div>
                  </div>

                  {localSightingIds.includes(sighting.id) && (
                    <TouchableOpacity
                      onPress={() => handleSightingDelete(sighting.id)}
                      style={{ 
                        padding: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        backgroundColor: isDarkMode ? "rgba(255,59,48,0.2)" : "rgba(255,59,48,0.1)",
                        marginLeft: "auto"
                      }}
                    >
                      <MaterialCommunityIcons name="trash-can" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SightingList;