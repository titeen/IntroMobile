import axios from "axios";

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

// Haalt alle UFO sightings op van de API
export const fetchSightings = async (): Promise<UfoSighting[]> => {
  try {
    const response = await axios.get<UfoSighting[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching UFO sightings:", error);
    return [];
  }
};
