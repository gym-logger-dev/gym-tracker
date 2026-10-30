import type { ExpoConfig } from 'expo/config';

// No secrets here (STORY-002 AC8). Identifiers are placeholders until Sev chooses real ones.
const config: ExpoConfig = {
  name: 'Gym Tracker',
  slug: 'gym-tracker',
  version: '0.0.1',
  scheme: 'gymtracker',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: { bundleIdentifier: 'com.example.gymtracker' },
  android: { package: 'com.example.gymtracker' },
  plugins: ['expo-router', 'expo-dev-client'],
  extra: { locale: 'en-AU' },
};

export default config;
