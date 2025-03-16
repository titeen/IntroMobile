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

// Sightings ophalen 
export const fetchSightings = async (): Promise<UfoSighting[]> => {
  try {
    const storedSightings = await AsyncStorage.getItem("sightings");
    const localSightings: UfoSighting[] = storedSightings ? JSON.parse(storedSightings) : [];
    const deletedSightings = await AsyncStorage.getItem("deletedSightings");
    const deletedIds: number[] = deletedSightings ? JSON.parse(deletedSightings) : [];
    
    try {
      const response = await axios.get<UfoSighting[]>(API_URL);
      let apiSightings = response.data.filter(sighting => !deletedIds.includes(sighting.id));
      const sightingsMap = new Map<number, UfoSighting>();
      
      apiSightings.forEach(sighting => {
        sightingsMap.set(sighting.id, sighting);
      });
      
      localSightings.forEach(sighting => {
        if (!deletedIds.includes(sighting.id)) {
          sightingsMap.set(sighting.id, sighting);
        }
      });
      
      return Array.from(sightingsMap.values());
    } catch (apiError) {
      console.warn("API niet beschikbaar, val terug op lokale sightings:", apiError);
      return localSightings.filter(sighting => !deletedIds.includes(sighting.id));
    }
  } catch (error) {
    console.error("Error fetching UFO sightings:", error);
    return [];
  }
};

// Nieuwe sighting toevoegen (Alleen in AsyncStorage)
export const addSighting = async (newSighting: UfoSighting) => {
  try {
    const storedSightings = await AsyncStorage.getItem("sightings");
    const sightings: UfoSighting[] = storedSightings ? JSON.parse(storedSightings) : [];
    sightings.push(newSighting);
    await AsyncStorage.setItem("sightings", JSON.stringify(sightings));
    
    console.log("Sighting succesvol opgeslagen in AsyncStorage");
  } catch (error) {
    console.error("Error bij het toevoegen van sighting:", error);
    throw error;
  }
};

// Sighting verwijderen
export const deleteSighting = async (id: number) => {
  try {
    const deletedSightings = await AsyncStorage.getItem("deletedSightings");
    let deletedIds: number[] = deletedSightings ? JSON.parse(deletedSightings) : [];

    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      await AsyncStorage.setItem("deletedSightings", JSON.stringify(deletedIds));
    }
    const storedSightings = await AsyncStorage.getItem("sightings");
    if (storedSightings) {
      const sightings: UfoSighting[] = JSON.parse(storedSightings);
      const updatedSightings = sightings.filter(sighting => sighting.id !== id);
      await AsyncStorage.setItem("sightings", JSON.stringify(updatedSightings));
    }
    
    console.log("Sighting succesvol verwijderd (ID:", id, ")");
  } catch (error) {
    console.error("Error bij het verwijderen van sighting:", error);
    throw error;
  }
};