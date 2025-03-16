"use dom";

import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "../services/themeContext"; 
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator } from "react-native-paper";

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

const SightingDetailWithTheme = () => {
  return (
    <ThemeProvider>
      <SightingDetail />
    </ThemeProvider>
  );
};

const SightingDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { witnessName, description, picture, status, dateTime, witnessContact, latitude, longitude } = params;
  const [locationName, setLocationName] = useState("Loading location...");
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode, theme } = useTheme();

  const formattedDateTime = Array.isArray(dateTime) ? dateTime[0] : dateTime as string;
  const imageUri = Array.isArray(picture) ? picture[0] : picture as string;
  const statusValue = Array.isArray(status) ? status[0] : status as string;
  const descriptionText = Array.isArray(description) ? description[0] : description as string;
  const witnessNameText = Array.isArray(witnessName) ? witnessName[0] : witnessName as string;
  const witnessContactText = Array.isArray(witnessContact) ? witnessContact[0] : witnessContact as string;

  useEffect(() => {
    if (latitude && longitude) {
      setIsLoading(true);
      const lat = parseFloat(Array.isArray(latitude) ? latitude[0] : latitude as string);
      const lng = parseFloat(Array.isArray(longitude) ? longitude[0] : longitude as string);
      getLocationName(lat, lng)
        .then((name) => setLocationName(name))
        .finally(() => setIsLoading(false));
    }
  }, [latitude, longitude]);

  return (
      <div style={{
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", 
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}>
      <div style={{
        width: "100%",
        maxWidth: "600px",
        backgroundColor: theme.colors.surface,
        borderRadius: "12px",
        padding: "24px",
        boxShadow: isDarkMode ? "0 8px 16px rgba(0,0,0,0.4)" : "0 8px 16px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{ 
          position: "relative", 
          width: "100%", 
          height: "300px", 
          borderRadius: "8px", 
          overflow: "hidden",
          marginBottom: "20px",
          backgroundColor: isDarkMode ? "#333" : "#f0f0f0",
        }}>
          {imageUri ? (
            <img 
              src={imageUri} 
              alt="UFO Sighting" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                borderRadius: "8px",
              }} 
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              flexDirection: "column",
            }}>
              <MaterialCommunityIcons name="image-off" size={48} color={isDarkMode ? "#888" : "#999"} />
              <Text style={{ color: isDarkMode ? "#888" : "#999", marginTop: 8 }}>No image available</Text>
            </div>
          )}
          <div style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: statusValue === "Confirmed" ? 
              (isDarkMode ? "#1e3a2f" : "#e6f4ea") : 
              (isDarkMode ? "#3a2f1e" : "#fff8e6"),
            color: statusValue === "Confirmed" ? "#4caf50" : "#ffc107",
            padding: "8px 12px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <MaterialCommunityIcons 
              name={statusValue.toLowerCase() === "confirmed" ? "check-circle" : "alert-circle"}
              color={statusValue.toLowerCase() === "confirmed" ? "#4caf50" : "#ffc107"} 
            />

            <span style={{
              fontWeight: "600",
              fontSize: "14px",
              color: theme.colors.text
            }}>{statusValue}</span>
          </div>
        </div>
        
        <h2 style={{ 
          color: theme.colors.primary, 
          marginBottom: "16px",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
        }}>{witnessNameText}</h2>
        
        <div style={{
          width: "100%",
          marginBottom: "24px",
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
          padding: "16px",
          borderRadius: "8px",
        }}>
          <p style={{
            fontSize: "16px",
            lineHeight: "1.6",
            margin: 0,
            color: theme.colors.text,
          }}>{descriptionText}</p>
        </div>
        
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <MaterialCommunityIcons name="calendar-month" size={20} color={theme.colors.primary} />
            <span style={{
              fontSize: "15px",
              color: theme.colors.text,
            }}>{formattedDateTime ? formatDate(formattedDateTime) : 'Unknown'}</span>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} />
            <span style={{
              fontSize: "15px",
              color: theme.colors.text,
            }}>{witnessContactText}</span>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} style={{ marginTop: 3 }} />
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <span style={{
                fontSize: "15px",
                color: theme.colors.text,
                flexGrow: 1,
              }}>{locationName}</span>
            )}
          </div>
        </div>
        
        <TouchableOpacity 
          onPress={() => router.push('/list')}
          style={{
            backgroundColor: theme.colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 30,
            alignSelf: "center",
            marginTop: 24,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Back to List</Text>
        </TouchableOpacity>
      </div>
    </div>
  );
};

export default SightingDetailWithTheme;