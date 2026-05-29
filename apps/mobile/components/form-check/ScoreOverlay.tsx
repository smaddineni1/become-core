/**
 * ScoreOverlay — Real-time scoring display during form check
 *
 * Displays:
 * - Live 0-100 score with color-coded arc gauge
 * - Rep counter
 * - Active corrective cues with animated entry
 * - Phase indicator
 */

import { View, Text } from 'react-native';
import type { ScoringState } from '../../lib/pose';

interface ScoreOverlayProps {
  state: ScoringState;
}

export function ScoreOverlay({ state }: ScoreOverlayProps) {
  const scoreColor = getScoreColor(state.currentScore);
  const formattedDuration = formatDuration(state.sessionDurationMs);

  return (
    <View className="absolute inset-0 pointer-events-none">
      {/* Top Bar — Rep Count & Duration */}
      <View className="flex-row justify-between items-center px-4 pt-12">
        <View className="bg-slate-900/90 rounded-xl px-4 py-2 border border-slate-700">
          <Text className="text-slate-400 text-xs">Reps</Text>
          <Text className="text-white text-2xl font-bold">
            {state.repCount}
          </Text>
        </View>
        <View className="bg-slate-900/90 rounded-xl px-4 py-2 border border-slate-700">
          <Text className="text-slate-400 text-xs">Duration</Text>
          <Text className="text-white text-lg font-semibold">
            {formattedDuration}
          </Text>
        </View>
      </View>

      {/* Center — Live Score Gauge */}
      <View className="absolute bottom-32 left-0 right-0 items-center">
        <View className="bg-slate-900/90 rounded-2xl px-8 py-5 border border-slate-700 items-center">
          {/* Score Number */}
          <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
            Score
          </Text>
          <Text
            className="text-5xl font-bold"
            style={{ color: scoreColor }}
          >
            {state.isReliable ? state.currentScore : '--'}
          </Text>

          {/* Score Bar */}
          <View className="w-48 h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${state.isReliable ? state.currentScore : 0}%`,
                backgroundColor: scoreColor,
              }}
            />
          </View>

          {/* Average */}
          {state.repCount > 0 && (
            <Text className="text-slate-400 text-xs mt-2">
              Avg: {state.averageScore} · Phase: {state.currentPhase}
            </Text>
          )}
        </View>
      </View>

      {/* Cue Overlays — Animated corrective feedback */}
      {state.activeCues.length > 0 && (
        <View className="absolute top-28 left-4 right-4 gap-2">
          {state.activeCues.map((cue, idx) => (
            <CueCard key={`${cue.cue}-${idx}`} cue={cue.cue} message={cue.message} severity={cue.severity} />
          ))}
        </View>
      )}

      {/* Position Warning */}
      {!state.isReliable && (
        <View className="absolute top-1/3 left-6 right-6">
          <View className="bg-amber-900/90 rounded-xl p-4 border border-amber-700">
            <Text className="text-amber-200 text-center font-semibold">
              Position yourself fully in frame
            </Text>
            <Text className="text-amber-300/70 text-center text-sm mt-1">
              Step back so your full body is visible
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * Individual corrective cue card
 */
function CueCard({
  cue,
  message,
  severity,
}: {
  cue: string;
  message: string;
  severity: number;
}) {
  const bgColor = severity > 0.5 ? 'bg-red-900/90' : 'bg-amber-900/90';
  const borderColor = severity > 0.5 ? 'border-red-600' : 'border-amber-600';
  const textColor = severity > 0.5 ? 'text-red-200' : 'text-amber-200';
  const icon = getCueIcon(cue);

  return (
    <View className={`${bgColor} rounded-xl px-4 py-3 border ${borderColor} flex-row items-center gap-3`}>
      <Text className="text-xl">{icon}</Text>
      <View className="flex-1">
        <Text className={`${textColor} font-semibold text-sm`}>{message}</Text>
      </View>
    </View>
  );
}

// ----- Helpers -----

function getScoreColor(score: number): string {
  if (score >= 80) return '#34D399'; // emerald-400
  if (score >= 50) return '#FBBF24'; // amber-400
  return '#F87171'; // red-400
}

function getCueIcon(cue: string): string {
  switch (cue) {
    case 'knee_cave': return '🦵';
    case 'deficient_depth': return '⬇️';
    case 'forward_lean': return '↗️';
    default: return '⚠️';
  }
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
