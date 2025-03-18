import { useState } from "react";
import { View, Image, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Text, Card, ToggleButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { eventEmitter } from "./list";
import { useTheme } from "../../services/themeContext";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { addSighting } from "../../services/api";

const UFO_ICON = L.icon({
  iconUrl: "https://raw.githubusercontent.com/similonap/public_icons/main/ufo.png",
  iconSize: [40, 40],
  popupAnchor: [0, -20],
});

const ReportSighting = () => {
  const [witnessName, setWitnessName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState("unconfirmed");
  const [witnessContact, setContact] = useState("");
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<{ witnessName?: string; description?: string; witnessContact?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isDarkMode, theme } = useTheme();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
    let newErrors: { witnessName?: string; description?: string; witnessContact?: string } = {};

    if (!witnessName.trim()) newErrors.witnessName = "Name is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!witnessContact.trim()) {
      newErrors.witnessContact = "Contact is required.";
    } else if (!isValidEmail(witnessContact)) {
      newErrors.witnessContact = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const newSighting = {
      id: Date.now(),
      witnessName,
      description,
      picture: photo || "https://raw.githubusercontent.com/similonap/public_icons/main/ufo.png", 
      status: status || "unconfirmed",  
      witnessContact,
      dateTime: new Date().toISOString(),
      location: location ? { latitude: location[0], longitude: location[1] } : { latitude: 51.2243, longitude: 4.3852 },
    };

    try {
      await addSighting(newSighting);
      console.log("Sighting added successfully");
      eventEmitter.emit("newSightingAdded", newSighting);
      router.push("/list");
    } catch (error) {
      console.error("Error adding sighting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  function LocationSelector() {
    useMapEvents({
      click(e) {
        setLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    return location ? <Marker position={location} icon={UFO_ICON} /> : null;
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    title: {
      textAlign: "center",
      marginBottom: 20,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    toggleLabel: {
      marginTop: 15,
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    mapTitle: {
      marginTop: 20,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    statusText: {
      textAlign: "center",
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.colors.text,
    },
    errorText: {
      color: isDarkMode ? "#ff6b6b" : "red",
      marginBottom: 10,
      fontSize: 14,
    },
    imageCard: {
      marginTop: 10,
      padding: 10,
      alignItems: "center",
      backgroundColor: theme.colors.surface,
    }
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      <Text variant="titleLarge" style={dynamicStyles.title}>
        Report a UFO Sighting 🛸
      </Text>

      <TextInput
        label="Witness Name"
        value={witnessName}
        onChangeText={setWitnessName}
        mode="outlined"
        style={styles.input}
        error={!!errors.witnessName}
        theme={theme}
      />
      {errors.witnessName && <Text style={dynamicStyles.errorText}>{errors.witnessName}</Text>}

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
        error={!!errors.description}
        theme={theme}
      />
      {errors.description && <Text style={dynamicStyles.errorText}>{errors.description}</Text>}

      <TextInput
        label="Email"
        value={witnessContact}
        onChangeText={setContact}
        mode="outlined"
        keyboardType="email-address"
        style={styles.input}
        error={!!errors.witnessContact}
        theme={theme}
      />
      {errors.witnessContact && <Text style={dynamicStyles.errorText}>{errors.witnessContact}</Text>}

      <Text style={dynamicStyles.toggleLabel}>Status:</Text>
      <Text style={dynamicStyles.statusText}>Current Status: {status}</Text>
      
      <ToggleButton.Row
        onValueChange={(value) => setStatus(value)}
        value={status}
        style={styles.toggleContainer}
      >
        <ToggleButton 
          icon={() => <MaterialCommunityIcons name="cancel" size={24} color={isDarkMode ? "#fff" : "#000"} />} 
          value="unconfirmed"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <ToggleButton 
          icon={() => <MaterialCommunityIcons name="check-circle" size={24} color={isDarkMode ? "#fff" : "#000"} />} 
          value="confirmed"
          style={{ backgroundColor: theme.colors.primary }}
        />
      </ToggleButton.Row>
      
      <Button 
        icon={() => <MaterialCommunityIcons name="camera" size={24} color="#fff" />} 
        mode="contained" 
        onPress={pickImage} 
        style={{...styles.button, backgroundColor: theme.colors.primary}}
      >
        Pick an Image
      </Button>

      {photo && (
        <Card style={dynamicStyles.imageCard}>
          <Image source={{ uri: photo }} style={styles.image} />
        </Card>
      )}

      <Text style={dynamicStyles.mapTitle}>Select Location:</Text>
      <View style={styles.mapContainer}>
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
        maxBoundsViscosity={0.5}    
        style={{ width: "100%", height: "100vh" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationSelector />
      </MapContainer>

      </View>

      <Button 
        mode="contained" 
        onPress={submitSighting} 
        style={{...styles.submitButton, backgroundColor: isDarkMode ? "#2e7d32" : "#00c853"}}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Sighting"}
      </Button>
      
      <View style={{height: 30}} /> 
    </ScrollView> 
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  mapContainer: {
    width: 500,
    height: 500,
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  submitButton: {
    marginTop: 20,
  },
  toggleContainer: {
    marginVertical: 10,
    justifyContent: "center",
  },
});

export default ReportSighting;