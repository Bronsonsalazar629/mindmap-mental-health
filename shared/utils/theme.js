// Theme utilities for SunPath AI
import { theme } from '../themes';

// Convert hex to rgba
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Get themed color with fallback
export const getThemedColor = (colorPath, fallback = '#000000') => {
  const keys = colorPath.split('.');
  let color = theme.colors;

  for (const key of keys) {
    if (color && color[key]) {
      color = color[key];
    } else {
      return fallback;
    }
  }

  return typeof color === 'string' ? color : fallback;
};

// Theme mode utilities
export const getThemeMode = (isDark = false) => {
  return isDark ? theme.colors.dark : theme.colors.light;
};

// Responsive spacing
export const getSpacing = (size) => {
  return theme.spacing[size] || size;
};

// Shadow utilities
export const getShadow = (size = 'md') => {
  return theme.shadows[size] || theme.shadows.md;
};

// Typography utilities
export const getTypography = (variant = 'base') => {
  return {
    fontSize: theme.typography.fontSize[variant],
    fontFamily: theme.typography.fontFamily.primary,
    lineHeight: theme.typography.lineHeight.normal,
  };
};

// Component style utilities
export const getButtonStyle = (variant = 'primary') => {
  return theme.components.button[variant] || theme.components.button.primary;
};

export const getCardStyle = () => {
  return theme.components.card;
};