import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Pressable, Text } from 'react-native';

/**
 * Root Layout — wraps entire app.
 * Renders the Genie FAB overlay globally (above all screens).
 */
export default function RootLayout() {
  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F172A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'slide_from_bottom' }} />
      </Stack>

      {/* Genie FAB — persistent across all screens */}
      <GenieFAB />
    </View>
  );
}

function GenieFAB() {
  return (
    <Pressable
      className="absolute bottom-28 right-6 w-14 h-14 rounded-full bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-600/30 active:bg-indigo-700"
      onPress={() => {
        // Opens Genie bottom sheet — implemented in Phase 6
      }}
    >
      <Text className="text-2xl">🧞</Text>
    </Pressable>
  );
}
