import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../services/themeContext';

interface ThemeToggleProps {
  style?: ViewStyle;
  size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ style, size = 24 }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity 
      onPress={toggleTheme} 
      style={{ 
        padding: 8,
        borderRadius: 20,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      <MaterialCommunityIcons 
        name={isDarkMode ? "weather-night" : "weather-sunny"} 
        size={size} 
        color={isDarkMode ? theme.colors.primary : theme.colors.primary} 
      />
    </TouchableOpacity>
  );
};

export default ThemeToggle;