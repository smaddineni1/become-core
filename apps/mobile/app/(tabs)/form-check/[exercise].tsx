import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { EXERCISES } from '@become/shared';
import type { ExerciseId } from '@become/shared';

export default function FormCheckSession() {
  const { exercise } = useLocalSearchParams<{ exercise: ExerciseId }>();
  const exerciseInfo = EXERCISES[exercise as ExerciseId];

  return (
    <View className="flex-1 bg-slate-950">
      {/* Split Screen Layout — Phase 3 implementation */}
      <View className="flex-1 flex-row">
        {/* Left: 3D Model */}
        <View className="flex-1 bg-slate-900 items-center justify-center border-r border-slate-800">
          <Text className="text-slate-500 text-sm">3D Model</Text>
          <Text className="text-white text-lg font-semibold mt-2">
            {exerciseInfo?.name ?? 'Exercise'}
          </Text>
        </View>

        {/* Right: Camera + Pose Overlay */}
        <View className="flex-1 bg-slate-900 items-center justify-center">
          <Text className="text-slate-500 text-sm">Camera Feed</Text>
          <Text className="text-slate-400 text-xs mt-2">
            MediaPipe Pose Detection
          </Text>
        </View>
      </View>

      {/* Score Overlay */}
      <View className="absolute bottom-8 left-0 right-0 items-center">
        <View className="bg-slate-900/90 rounded-2xl px-8 py-4 border border-slate-700">
          <Text className="text-slate-400 text-sm text-center">Score</Text>
          <Text className="text-5xl font-bold text-indigo-400 text-center">
            --
          </Text>
          <Text className="text-slate-500 text-xs text-center mt-1">
            Reps: 0
          </Text>
        </View>
      </View>
    </View>
  );
}
