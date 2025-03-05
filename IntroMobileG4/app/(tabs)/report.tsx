import { useState } from "react";
import { View, Image, ScrollView, StyleSheet } from "react-native";  // ScrollView toegevoegd
import { TextInput, Button, Text, Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const UFO_ICON = L.icon({
  iconUrl: "https://raw.githubusercontent.com/similonap/public_icons/main/ufo.png",
  iconSize: [40, 40],
  popupAnchor: [0, -20],
});

const ReportSighting = () => {
  const [witnessName, setWitnessName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState("Unconfirmed");
  const [location, setLocation] = useState<[number, number] | null>(null);
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const submitSighting = async () => {
    const newSighting = {
      id: Date.now(),
      witnessName,
      description,
      picture: photo,
      status,
      dateTime: new Date().toISOString(),
      location: location ? { latitude: location[0], longitude: location[1] } : null,
    };

    const storedSightings = await AsyncStorage.getItem("sightings");
    const sightings = storedSightings ? JSON.parse(storedSightings) : [];
    sightings.push(newSighting);

    await AsyncStorage.setItem("sightings", JSON.stringify(sightings));
    router.push("/list");
  };

  function LocationSelector() {
    useMapEvents({
      click(e) {
        setLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    return location ? <Marker position={location} icon={UFO_ICON} /> : null;
  }

  return (
    <ScrollView style={styles.container}>  {/* ScrollView toegevoegd */}
      <Text variant="titleLarge" style={styles.title}>
        Report a UFO Sighting 🛸
      </Text>

      <TextInput
        label="Witness Name"
        value={witnessName}
        onChangeText={setWitnessName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Button icon="camera" mode="contained" onPress={pickImage} style={styles.button}>
        Pick an Image
      </Button>

      {photo && (
        <Card style={styles.imageCard}>
          <Image source={{ uri: photo }} style={styles.image} />
        </Card>
      )}

      <Text style={styles.mapTitle}>Select Location:</Text>
      <View style={styles.mapContainer}>
        <MapContainer center={[51.2243, 4.3852]} zoom={3} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationSelector />
        </MapContainer>
      </View>

      <Button mode="contained" onPress={submitSighting} style={styles.submitButton}>
        Submit Sighting
      </Button>
    </ScrollView> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#6200ee",
  },
  imageCard: {
    marginTop: 10,
    padding: 10,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  mapTitle: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  mapContainer: {
    height: 300,
    marginVertical: 10,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#00c853",
  },
});

export default ReportSighting;
