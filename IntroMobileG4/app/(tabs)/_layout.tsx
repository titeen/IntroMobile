import { Tabs } from 'expo-router';
import { ThemeProvider, useTheme } from '../../services/themeContext';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ThemeToggle from '../../components/themeToggle';
function TabsNavigator() {
  const { isDarkMode, theme } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: isDarkMode ? '#888888' : '#555555',
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerRight: () => (
            <ThemeToggle style={{ marginRight: 16 }} />
          ),
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'UFO Map',
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
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabsNavigator />
    </ThemeProvider>
  );
}