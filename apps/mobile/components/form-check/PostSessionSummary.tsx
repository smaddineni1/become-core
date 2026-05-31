/**
 * PostSessionSummary — End-of-session results screen
 *
 * Displayed after the user ends a form check session.
 * Shows rep-by-rep breakdown, most frequent cues, and overall score.
 */

import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import type { ExerciseId } from '@app/packages/shared';
import { EXERCISES } from '@app/packages/shared';

interface SessionResult {
  exerciseId: ExerciseId;
  totalReps: number;
  averageScore: number;
  repScores: number[];
  durationSeconds: number;
  cuesDetected: Array<{ cue: string; count: number }>;
}

interface PostSessionSummaryProps {
  result: SessionResult;
  onDismiss: () => void;
}

export function PostSessionSummary({ result, onDismiss }: PostSessionSummaryProps) {
  const exercise = EXERCISES[result.exerciseId];
  const scoreColor = getScoreColor(result.averageScore);
  const grade = getGrade(result.averageScore);

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-8 items-center">
        {/* Grade Badge */}
        <View
          className="w-28 h-28 rounded-full items-center justify-center border-4"
          style={{ borderColor: scoreColor }}
        >
          <Text className="text-4xl font-bold" style={{ color: scoreColor }}>
            {grade}
          </Text>
        </View>

        <Text className="text-white text-2xl font-bold mt-6">
          Session Complete
        </Text>
        <Text className="text-slate-400 mt-1 text-base">
          {exercise.name} · {formatDuration(result.durationSeconds)}
        </Text>
      </View>

      {/* Stats Row */}
      <View className="px-6 flex-row gap-3 mb-6">
        <StatCard label="Reps" value={String(result.totalReps)} color="#6366F1" />
        <StatCard label="Avg Score" value={String(result.averageScore)} color={scoreColor} />
        <StatCard
          label="Duration"
          value={formatDuration(result.durationSeconds)}
          color="#94A3B8"
        />
      </View>

      {/* Rep-by-Rep Breakdown */}
      {result.repScores.length > 0 && (
        <View className="px-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Rep Breakdown
          </Text>
          <View className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {result.repScores.map((score, idx) => (
              <View
                key={idx}
                className={`flex-row items-center justify-between px-4 py-3 ${
                  idx < result.repScores.length - 1 ? 'border-b border-slate-800' : ''
                }`}
              >
                <Text className="text-slate-400 text-sm">Rep {idx + 1}</Text>
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden"
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${score}%`,
                        backgroundColor: getScoreColor(score),
                      }}
                    />
                  </View>
                  <Text
                    className="text-sm font-semibold w-8 text-right"
                    style={{ color: getScoreColor(score) }}
                  >
                    {score}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Cues Detected */}
      {result.cuesDetected.length > 0 && (
        <View className="px-6 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Areas to Improve
          </Text>
          <View className="gap-2">
            {result.cuesDetected.map((cue) => (
              <View
                key={cue.cue}
                className="bg-amber-900/30 rounded-xl p-4 border border-amber-800/30 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-lg">{getCueIcon(cue.cue)}</Text>
                  <Text className="text-amber-200 font-medium capitalize">
                    {cue.cue.replace(/_/g, ' ')}
                  </Text>
                </View>
                <Text className="text-amber-400 font-bold">
                  {cue.count}x
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Actions */}
      <View className="px-6 pb-10 gap-3">
        <Pressable
          className="bg-indigo-600 rounded-xl py-4 active:bg-indigo-700"
          onPress={onDismiss}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Done
          </Text>
        </Pressable>
        <Pressable
          className="border border-slate-700 rounded-xl py-4 active:bg-slate-800"
          onPress={() => {
            onDismiss();
            router.push(`/(tabs)/form-check/${result.exerciseId}`);
          }}
        >
          <Text className="text-indigo-400 text-center font-semibold text-lg">
            Try Again
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ----- Helpers -----

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800 items-center">
      <Text className="text-2xl font-bold" style={{ color }}>{value}</Text>
      <Text className="text-slate-400 text-xs mt-1">{label}</Text>
    </View>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#34D399';
  if (score >= 50) return '#FBBF24';
  return '#F87171';
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function getCueIcon(cue: string): string {
  switch (cue) {
    case 'knee_cave': return '🦵';
    case 'deficient_depth': return '⬇️';
    case 'forward_lean': return '↗️';
    default: return '⚠️';
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
