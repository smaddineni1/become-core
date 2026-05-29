import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function DigitalTwinScan() {
  return (
    <View className="flex-1 bg-slate-950 items-center justify-center px-6">
      {/* 60-second animated scanning UI — Phase 2.5 */}
      <View className="w-64 h-64 rounded-full border-4 border-indigo-600 items-center justify-center">
        <Text className="text-6xl">🧬</Text>
      </View>

      <Text className="text-white text-2xl font-bold mt-8 text-center">
        Digital Twin Scan
      </Text>
      <Text className="text-slate-400 mt-3 text-center text-base leading-6">
        Creating your personalized biometric profile.
        {'\n'}This takes about 60 seconds.
      </Text>

      <View className="mt-8 bg-slate-900 rounded-xl p-4 border border-slate-800 w-full">
        <Text className="text-slate-400 text-xs text-center leading-5">
          Privacy: Your biometric data is encrypted and stored securely.
          {'\n'}Only you can access your measurements.
        </Text>
      </View>

      <Pressable
        className="bg-indigo-600 rounded-xl py-4 mt-8 w-full active:bg-indigo-700"
        onPress={() => router.replace('/(tabs)/home')}
      >
        <Text className="text-white text-center font-semibold text-lg">
          Begin Scan
        </Text>
      </Pressable>
    </View>
  );
}
