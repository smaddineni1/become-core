import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Become',
  slug: 'become',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'become',
  splash: { backgroundColor: '#0F172A', resizeMode: 'contain' },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.become.app',
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      NSCameraUsageDescription: 'Become uses your camera for AI-powered form analysis. Video is processed on-device and never uploaded.',
      NSHealthShareUsageDescription: 'Become reads HRV data for personalized mindfulness recommendations.',
      UIBackgroundModes: ['fetch'],
    },
  },
  android: {
    adaptiveIcon: { backgroundColor: '#0F172A' },
    package: 'com.become.app',
    permissions: ['CAMERA', 'ACTIVITY_RECOGNITION'],
  },
  plugins: ['expo-router', ['expo-camera', { cameraPermission: 'Become uses your camera for AI form analysis. Video never leaves your device.' }]],
  experiments: { typedRoutes: true },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    revenuecatIosKey: process.env.EXPO_PUBLIC_RC_IOS_API_KEY,
    revenuecatAndroidKey: process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY,
    eas: { projectId: 'ceb003ee-2457-40ec-9be9-af32cb4b18e4' },
  },
  updates: { url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID ?? ''}` },
  runtimeVersion: { policy: 'sdkVersion' },
});
