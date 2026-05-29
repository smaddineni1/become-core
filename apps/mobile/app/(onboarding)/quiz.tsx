import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function OnboardingQuiz() {
  return (
    <View className="flex-1 bg-slate-950 px-6 pt-16">
      <Text className="text-3xl font-bold text-white">
        Let's personalize your journey
      </Text>
      <Text className="text-slate-400 mt-2 text-base">
        Answer a few questions so we can build your plan
      </Text>

      {/* Multi-step quiz — full implementation Phase 2.4 */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-slate-500">
          Multi-step quiz (6-8 screens)
        </Text>
      </View>

      <Pressable
        className="bg-indigo-600 rounded-xl py-4 mb-8 active:bg-indigo-700"
        onPress={() => router.push('/(onboarding)/scan')}
      >
        <Text className="text-white text-center font-semibold text-lg">
          Continue to Body Scan
        </Text>
      </Pressable>
    </View>
  );
}
