import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    primaryVariant: '#3700b3',
    secondary: '#03dac6',
    secondaryVariant: '#018786',
    background: '#f8f9fa',
    surface: '#ffffff',
    error: '#b00020',
    text: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    card: '#ffffff',
    border: '#e1e1e1',
    notification: '#f50057',
    statusBar: 'dark-content',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    primaryVariant: '#3700b3',
    secondary: '#03dac6',
    secondaryVariant: '#018786',
    background: '#121212',
    surface: '#1e1e1e',
    error: '#cf6679',
    text: '#ffffff',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
    card: '#2d2d2d',
    border: '#333333',
    notification: '#ff4081',
    statusBar: 'light-content',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },
};

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof lightTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem('themePreference');
        const newDarkMode = themePreference === 'dark';
        setIsDarkMode(newDarkMode);
        setTheme(newDarkMode ? darkTheme : lightTheme);
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      setIsDarkMode(newThemeValue);
      setTheme(newThemeValue ? darkTheme : lightTheme);
      await AsyncStorage.setItem('themePreference', newThemeValue ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};