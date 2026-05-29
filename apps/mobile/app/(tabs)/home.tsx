import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { getReadinessScore, type ReadinessResponse } from '../../lib/api/readiness';

export default function HomeScreen() {
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReadiness();
  }, []);

  const loadReadiness = async () => {
    setIsLoading(true);
    const result = await getReadinessScore();
    if (result.success && result.data) setReadiness(result.data);
    setIsLoading(false);
  };

  const scoreColor = readiness
    ? readiness.classification === 'recovered' ? '#34D399'
      : readiness.classification === 'balanced' ? '#FBBF24' : '#F87171'
    : '#6366F1';

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-6">
        <Text className="text-3xl font-bold text-white">Welcome back</Text>
        <Text className="text-slate-400 mt-2 text-base">Your daily wellness summary</Text>
      </View>

      {/* Readiness Score Card */}
      <View className="px-6 mb-4">
        <Pressable
          className="bg-slate-900 rounded-2xl p-6 border border-slate-800 active:bg-slate-800"
          onPress={() => router.push('/(tabs)/mind-body/hrv')}
        >
          <Text className="text-slate-400 text-sm uppercase tracking-wider">Readiness Score</Text>
          <View className="flex-row items-baseline mt-2">
            <Text className="text-5xl font-bold" style={{ color: scoreColor }}>
              {isLoading ? '--' : readiness?.score ?? '--'}
            </Text>
            <Text className="text-slate-400 text-lg ml-1">/100</Text>
          </View>
          <Text className="text-slate-300 text-sm mt-2 capitalize">
            {readiness?.classification ?? 'Loading...'}
          </Text>

          {/* Factor Breakdown */}
          {readiness && (
            <View className="flex-row gap-4 mt-4">
              <FactorPill label="HRV" value={readiness.factors.hrv} />
              <FactorPill label="Heart Rate" value={readiness.factors.restingHR} />
              <FactorPill label="Sleep" value={readiness.factors.sleep} />
            </View>
          )}
        </Pressable>
      </View>

      {/* Today's Recommendation Card */}
      {readiness && (
        <View className="px-6 mb-4">
          <Pressable
            className="bg-indigo-950/50 rounded-2xl p-5 border border-indigo-800/30 active:bg-indigo-900/50"
            onPress={() => router.push(readiness.recommendation.suggestedRoute as any)}
          >
            <Text className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              Today's Recommendation
            </Text>
            <Text className="text-white text-lg font-semibold mt-2">
              {readiness.recommendation.message}
            </Text>
            <View className="flex-row items-center gap-2 mt-3">
              <View className="bg-indigo-600 rounded-full px-3 py-1.5">
                <Text className="text-white text-xs font-semibold">
                  Go →
                </Text>
              </View>
              <Text className="text-slate-400 text-xs capitalize">
                Focus: {readiness.recommendation.nutritionFocus} nutrition
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Quick Stats */}
      <View className="px-6 gap-4">
        <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <Text className="text-slate-400 text-sm">Meal Plan</Text>
          <Text className="text-lg font-semibold text-white mt-1">
            {readiness?.recommendation.nutritionFocus === 'recovery'
              ? 'Recovery-Optimized' : 'Ready'}
          </Text>
          <Text className="text-slate-500 text-sm mt-1">View today's whole-food plan</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function FactorPill({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? '#34D399' : value >= 40 ? '#FBBF24' : '#F87171';
  return (
    <View className="bg-slate-800 rounded-lg px-3 py-1.5">
      <Text className="text-slate-400 text-xs">{label}</Text>
      <Text className="font-bold text-sm" style={{ color }}>{value}</Text>
    </View>
  );
}
