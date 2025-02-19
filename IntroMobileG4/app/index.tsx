"use dom"

import { MapContainer, Marker, Popup, SVGOverlay, TileLayer, useMap, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from "leaflet";
import { View, Text } from "react-native";
import { useState } from "react";

const position: LatLngTuple = [51.2243, 4.3852];

interface PointOfInterest {
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}


const POINTS_OF_INTEREST : PointOfInterest[] = [
    {
      name: "AP Hogeschool",
      location: {
        latitude: 51.2243,
        longitude: 4.3852
      },
    },
];

interface LocationHandlerProps {
  addMarker: (lat: number, lng: number) => void;
}
const LocationHandler = ({addMarker} : LocationHandlerProps) => {
  const map = useMapEvents({
    dragend: () => {
      console.log(map.getCenter());
    },
    click: (e) => {
      addMarker(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}

const Index = () => {

  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>(POINTS_OF_INTEREST);

  const iconX = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/similonap/public_icons/refs/heads/main/location-pin.png',
    iconSize: [48, 48],
    popupAnchor: [-3, 0],
  });

  const addPointOfInterest = (lat: number, lng: number) => {
    setPointsOfInterest([...pointsOfInterest, {name: "New Point", location: {latitude: lat, longitude: lng}}]);
  }

  return (
    <MapContainer
      center={{ lat: 51.2243, lng: 4.3852 }}
      zoom={13}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      attributionControl={false}
    >

      <TileLayer
        // attribution='&copy; <a href="https://www.openstreretmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationHandler addMarker={(lat, lng) => addPointOfInterest(lat,lng)} />
      {pointsOfInterest.map((point, index) => (
        <Marker key={index} position={[point.location.latitude, point.location.longitude]} icon={iconX}>
          <Popup >
             <View style={{backgroundColor: 'white', padding: 10, width: 100}}>
                <Text>{point.name}</Text>
             </View>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}

export default Index;