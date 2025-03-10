import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'UFO map',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Sightings List',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report Sighting',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="plus-circle" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
