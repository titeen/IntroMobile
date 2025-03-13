"use dom";

import { useRouter } from "expo-router";
import { View, Text, Image, StyleSheet, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

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

const SightingDetail = () => {
  const router = useRouter();
  const { witnessName, description, picture, status, dateTime, witnessContact, latitude, longitude } = useLocalSearchParams();
  const [locationName, setLocationName] = useState("Loading location...");

  const formattedDateTime = Array.isArray(dateTime) ? dateTime[0] : dateTime;
  const imageUri = Array.isArray(picture) ? picture[0] : picture;

  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(Array.isArray(latitude) ? latitude[0] : latitude);
      const lng = parseFloat(Array.isArray(longitude) ? longitude[0] : longitude);
      getLocationName(lat, lng).then((name) => setLocationName(name));
    }
  }, [latitude, longitude]);

  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <Text>No Image Available</Text>
      )}
      <Text style={styles.title}>{witnessName}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.dateTime}>Date: {formattedDateTime ? formatDate(formattedDateTime) : 'Unknown'}</Text>
      <Text style={styles.contact}>Contact: {witnessContact}</Text>
      <Text style={styles.location}>Location: {locationName}</Text>
      <Button title="Back to list" onPress={() => router.push('/list')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  description: {
    textAlign: "center",
    marginVertical: 10,
  },
  status: {
    fontStyle: "italic",
    marginBottom: 10,
  },
  dateTime: {
    fontStyle: "italic",
    fontWeight: "bold",
    marginBottom: 10,
  },
  contact: {
    fontStyle: "italic",
    marginBottom: 10,
  },
  location: {
    fontStyle: "italic",
    marginBottom: 10,
  },
});

export default SightingDetail;