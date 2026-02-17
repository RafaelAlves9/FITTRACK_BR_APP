/**
 * FitTrack Design System
 * Modern violet/purple color palette inspired by Gofit app
 */

export const colors = {
  // Primary - Violet/Purple (main brand color)
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  
  // Secondary - Indigo (accent)
  secondary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Accent - Emerald (for success/progress)
  accent: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Background - Dark theme (inspired by Gofit)
  background: {
    primary: '#0F0F14',
    secondary: '#16161D',
    tertiary: '#1C1C26',
    card: '#1E1E2A',
    elevated: '#252533',
    overlay: 'rgba(0, 0, 0, 0.85)',
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    disabled: '#52525B',
    inverse: '#0F0F14',
  },
  
  // Functional
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Borders
  border: {
    default: '#27272A',
    light: '#3F3F46',
    focus: '#8B5CF6',
  },
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Gradient presets
  gradients: {
    primary: ['#8B5CF6', '#6366F1'],
    primaryDark: ['#7C3AED', '#4F46E5'],
    card: ['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)'],
    success: ['#10B981', '#059669'],
  },
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  neon: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

// Workout specific constants
export const workoutLevels = {
  beginner: {
    label: 'Iniciante',
    color: '#10B981',
  },
  intermediate: {
    label: 'Intermediário',
    color: '#F59E0B',
  },
  advanced: {
    label: 'Avançado',
    color: '#EF4444',
  },
};

export const workoutCategories = {
  musculation: {
    label: 'Musculação',
    icon: 'barbell',
  },
  yoga: {
    label: 'Yoga',
    icon: 'body',
  },
  crossfit: {
    label: 'CrossFit',
    icon: 'fitness',
  },
  cardio: {
    label: 'Cardio',
    icon: 'heart',
  },
  stretching: {
    label: 'Alongamento',
    icon: 'accessibility',
  },
  functional: {
    label: 'Funcional',
    icon: 'flash',
  },
};
