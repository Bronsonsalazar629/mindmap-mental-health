// SunPath AI App Constants

export const APP_INFO = {
  name: 'SunPath AI',
  tagline: 'Navigate Your Path to Mental Wellness',
  description: 'AI-powered mental health support and guidance',
  version: '1.0.0',
};

export const THEME_NAMES = {
  COASTAL_MORNING: 'Coastal Morning',
  SUNSET_WARM: 'Sunset Warm',
  FOREST_CALM: 'Forest Calm',
};

export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  AUTH: '/api/auth',
  USERS: '/api/users',
  MOOD: '/api/mood',
  RECOMMENDATIONS: '/api/recommendations',
  INTERVENTIONS: '/api/interventions',
  RESEARCH: '/api/research',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sunpath_auth_token',
  USER_PREFERENCES: 'sunpath_user_preferences',
  THEME_MODE: 'sunpath_theme_mode',
  ONBOARDING_COMPLETED: 'sunpath_onboarding_completed',
};

export const SCREEN_NAMES = {
  // Auth screens
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main app screens
  HOME: 'Home',
  DASHBOARD: 'Dashboard',
  MOOD_TRACKER: 'MoodTracker',
  RECOMMENDATIONS: 'Recommendations',
  PROGRESS: 'Progress',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',

  // Feature screens
  AI_CHAT: 'AIChat',
  MEDITATION: 'Meditation',
  JOURNAL: 'Journal',
  RESOURCES: 'Resources',
  EMERGENCY: 'Emergency',
};

export const COLORS_SEMANTIC = {
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
};