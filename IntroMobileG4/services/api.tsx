import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://sampleapis.assimilate.be/ufo/sightings";

export interface UfoSighting {
  id: number;
  witnessName: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  picture: string;
  status: string;
  dateTime: string;
  witnessContact: string;
}

// Sightings ophalen (zowel van API als AsyncStorage)
export const fetchSightings = async (): Promise<UfoSighting[]> => {
  try {
    // uit AsyncStorage
    const storedSightings = await AsyncStorage.getItem("sightings");
    const localSightings: UfoSighting[] = storedSightings ? JSON.parse(storedSightings) : [];

    // sightings op van de API
    const response = await axios.get<UfoSighting[]>(API_URL);
    const apiSightings = response.data;

    // Combineer
    return [...apiSightings, ...localSightings];
  } catch (error) {
    console.error("Error fetching UFO sightings:", error);
    return [];
  }
};

// Nieuwe sighting toevoegen aan AsyncStorage
export const addSighting = async (newSighting: UfoSighting) => {
  try {
    const storedSightings = await AsyncStorage.getItem("sightings");
    const sightings: UfoSighting[] = storedSightings ? JSON.parse(storedSightings) : [];
    sightings.push(newSighting);
    await AsyncStorage.setItem("sightings", JSON.stringify(sightings));
  } catch (error) {
    console.error("Error saving sighting:", error);
  }

};