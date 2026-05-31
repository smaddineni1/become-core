import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { EXERCISES, LAUNCH_EXERCISES } from '@app/packages/shared';

export default function FormCheckScreen() {
  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-3xl font-bold text-white">Form Check</Text>
        <Text className="text-slate-400 mt-2 text-base">
          Select an exercise to begin AI-powered form analysis
        </Text>
      </View>

      <View className="px-6 gap-4">
        {LAUNCH_EXERCISES.map((id) => {
          const exercise = EXERCISES[id];
          return (
            <Pressable
              key={id}
              className="bg-slate-900 rounded-2xl p-5 border border-slate-800 active:bg-slate-800"
              onPress={() => router.push(`/(tabs)/form-check/${id}`)}
            >
              <Text className="text-xl font-semibold text-white">
                {exercise.name}
              </Text>
              <Text className="text-slate-400 mt-1 text-sm">
                {exercise.description}
              </Text>
              <View className="flex-row gap-2 mt-3">
                {exercise.muscleGroups.map((muscle) => (
                  <View
                    key={muscle}
                    className="bg-indigo-950 px-3 py-1 rounded-full"
                  >
                    <Text className="text-indigo-300 text-xs capitalize">
                      {muscle.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
