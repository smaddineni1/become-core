/**
 * Form Check Session Screen — Split-Screen Layout
 *
 * Left: 3D character model executing perfect form
 * Right: User's camera with skeletal overlay + live scoring
 *
 * On-device scoring pipeline processes at 15-30fps.
 */

import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import { EXERCISES } from '@app/packages/shared';
import type { ExerciseId } from '@app/packages/shared';
import { ThreeDModelViewer } from '../../../components/form-check/ThreeDModelViewer';
import { CameraWithPose } from '../../../components/form-check/CameraWithPose';
import { ScoreOverlay } from '../../../components/form-check/ScoreOverlay';
import { PostSessionSummary } from '../../../components/form-check/PostSessionSummary';
import { ScoringPipeline } from '../../../lib/pose';
import type { ScoringState, MediaPipePoseResult } from '../../../lib/pose';

type SessionPhase = 'ready' | 'active' | 'summary';

export default function FormCheckSession() {
  const { exercise } = useLocalSearchParams<{ exercise: string }>();
  const exerciseId = exercise as ExerciseId;
  const exerciseInfo = EXERCISES[exerciseId];

  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('ready');
  const [scoringState, setScoringState] = useState<ScoringState>({
    currentScore: 0,
    averageScore: 0,
    repCount: 0,
    currentPhase: 'standing',
    activeCues: [],
    isReliable: false,
    jointAngles: {},
    repScores: [],
    sessionDurationMs: 0,
  });
  const [sessionResult, setSessionResult] = useState<{
    totalReps: number;
    averageScore: number;
    repScores: number[];
    durationSeconds: number;
  } | null>(null);

  const pipelineRef = useRef<ScoringPipeline | null>(null);
  const cueCountsRef = useRef<Map<string, number>>(new Map());

  // Initialize scoring pipeline
  const startSession = useCallback(() => {
    const pipeline = new ScoringPipeline(exerciseId, {
      onScoreUpdate: (state) => {
        setScoringState(state);
      },
      onRepCompleted: (repNumber, score) => {
        // Haptic feedback would fire here
      },
      onCueTriggered: (cue, message) => {
        const current = cueCountsRef.current.get(cue) ?? 0;
        cueCountsRef.current.set(cue, current + 1);
        // Haptic pulse pattern here
      },
    });

    pipelineRef.current = pipeline;
    setSessionPhase('active');
  }, [exerciseId]);

  // End session and show summary
  const endSession = useCallback(() => {
    if (pipelineRef.current) {
      const summary = pipelineRef.current.getSessionSummary();
      setSessionResult(summary);
      setSessionPhase('summary');
    }
  }, []);

  // Handle frame from camera
  const handleFrameProcessed = useCallback((landmarks: Record<string, { x: number; y: number; z: number }>) => {
    if (pipelineRef.current && sessionPhase === 'active') {
      // In production, this receives the full MediaPipePoseResult
      // For now, the pipeline.processFrame() is called with mock data
    }
  }, [sessionPhase]);

  if (!exerciseInfo) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-white">Exercise not found</Text>
      </View>
    );
  }

  // Post-session summary view
  if (sessionPhase === 'summary' && sessionResult) {
    return (
      <PostSessionSummary
        result={{
          exerciseId,
          ...sessionResult,
          cuesDetected: Array.from(cueCountsRef.current.entries()).map(([cue, count]) => ({
            cue,
            count,
          })),
        }}
        onDismiss={() => router.back()}
      />
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      {/* Ready Phase — Pre-session info */}
      {sessionPhase === 'ready' && (
        <View className="flex-1">
          {/* Preview of the split-screen */}
          <View className="flex-1 flex-row">
            <View className="flex-1 border-r border-slate-800">
              <ThreeDModelViewer exerciseId={exerciseId} isPlaying={true} animationSpeed={0.5} />
            </View>
            <View className="flex-1">
              <CameraWithPose isActive={false} />
            </View>
          </View>

          {/* Start Overlay */}
          <View className="absolute inset-0 bg-slate-950/80 items-center justify-center px-6">
            <View className="bg-slate-900 rounded-2xl p-8 border border-slate-800 w-full max-w-sm items-center">
              <Text className="text-3xl mb-3">🏋️</Text>
              <Text className="text-white text-2xl font-bold text-center">
                {exerciseInfo.name}
              </Text>
              <Text className="text-slate-400 mt-2 text-center text-sm leading-5">
                Position yourself so your full body is visible.{'\n'}
                The 3D model on the left shows perfect form.
              </Text>

              <View className="mt-6 gap-2 w-full">
                <View className="flex-row items-center gap-2">
                  <Text className="text-emerald-400 text-sm">✓</Text>
                  <Text className="text-slate-300 text-sm">Stand 6-8 feet from camera</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-emerald-400 text-sm">✓</Text>
                  <Text className="text-slate-300 text-sm">Well-lit environment</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-emerald-400 text-sm">✓</Text>
                  <Text className="text-slate-300 text-sm">Tight-fitting clothing preferred</Text>
                </View>
              </View>

              <Pressable
                className="bg-indigo-600 rounded-xl py-4 mt-6 w-full active:bg-indigo-700"
                onPress={startSession}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Start Session
                </Text>
              </Pressable>

              <Pressable className="mt-3" onPress={() => router.back()}>
                <Text className="text-slate-400 text-center">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Active Phase — Live Form Check */}
      {sessionPhase === 'active' && (
        <View className="flex-1">
          {/* Split Screen */}
          <View className="flex-1 flex-row">
            {/* Left: 3D Reference Model */}
            <View className="flex-1 border-r border-slate-800">
              <ThreeDModelViewer exerciseId={exerciseId} isPlaying={true} />
            </View>

            {/* Right: Camera + Pose */}
            <View className="flex-1">
              <CameraWithPose isActive={true} onFrameProcessed={handleFrameProcessed} />
            </View>
          </View>

          {/* Score Overlay (absolute, spans full screen) */}
          <ScoreOverlay state={scoringState} />

          {/* End Session Button */}
          <View className="absolute bottom-6 left-0 right-0 items-center">
            <Pressable
              className="bg-red-600/90 rounded-full px-8 py-3 active:bg-red-700"
              onPress={endSession}
            >
              <Text className="text-white font-semibold">End Session</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
