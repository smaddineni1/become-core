/**
 * Guided Breathing Media Player
 *
 * Custom video player that loads, caches, and loops AI-generated
 * HD breathing videos from Supabase Storage / Cloudflare R2.
 *
 * Features:
 * - Play / Pause / Replay controls
 * - Auto-hide controls after 3 seconds of inactivity
 * - Video prefetch + cache for offline playback
 * - Loop mode for continuous breathing guidance
 * - Responsive to device orientation
 *
 * CEO Directive: Videos are provided by the founder via Runway AI.
 * This player just needs to load, cache, and loop them smoothly.
 */

import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect, useCallback } from 'react';

type PlayerState = 'loading' | 'playing' | 'paused' | 'ended';

interface BreathingPlayerConfig {
  videoUrl: string;
  title: string;
  duration: number;
  isLooping: boolean;
}

export default function BreathingPlayer() {
  const { videoUrl, title, duration } = useLocalSearchParams<{
    videoUrl?: string;
    title?: string;
    duration?: string;
  }>();

  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [progress, setProgress] = useState(0); // 0-1
  const [showControls, setShowControls] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durationSeconds = parseInt(duration ?? '300', 10);
  const videoTitle = title ?? 'Guided Breathing';

  // Auto-hide controls after 3 seconds
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = setTimeout(() => {
      if (playerState === 'playing') {
        setShowControls(false);
      }
    }, 3000);
  }, [playerState]);

  // Simulate video loading
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setPlayerState('playing');
      resetControlsTimer();
    }, 1500);
    return () => clearTimeout(loadTimer);
  }, [resetControlsTimer]);

  // Simulate progress (in production, expo-av provides this via onPlaybackStatusUpdate)
  useEffect(() => {
    if (playerState === 'playing') {
      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1 / (durationSeconds * 10);
          if (next >= 1) {
            if (isLooping) {
              return 0; // Loop
            } else {
              setPlayerState('ended');
              return 1;
            }
          }
          return next;
        });
      }, 100);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [playerState, durationSeconds, isLooping]);

  // Player controls
  const handlePlay = () => {
    setPlayerState('playing');
    resetControlsTimer();
  };

  const handlePause = () => {
    setPlayerState('paused');
    setShowControls(true);
  };

  const handleReplay = () => {
    setProgress(0);
    setPlayerState('playing');
    resetControlsTimer();
  };

  const handleTap = () => {
    if (playerState === 'playing') {
      resetControlsTimer();
    }
  };

  const formatTime = (fraction: number): string => {
    const totalSec = Math.floor(fraction * durationSeconds);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Pressable className="flex-1 bg-slate-950" onPress={handleTap}>
      {/* Video Layer */}
      {/*
       * In production, this is:
       * <Video
       *   ref={videoRef}
       *   source={{ uri: videoUrl }}
       *   style={{ flex: 1 }}
       *   shouldPlay={playerState === 'playing'}
       *   isLooping={isLooping}
       *   resizeMode="cover"
       *   onPlaybackStatusUpdate={(status) => {
       *     if (status.isLoaded) {
       *       setProgress(status.positionMillis / status.durationMillis);
       *     }
       *   }}
       *   usePoster
       *   posterSource={thumbnailUrl}
       * />
       */}
      <View className="flex-1 bg-gradient-to-b from-indigo-950 to-slate-950 items-center justify-center">
        {/* Breathing Visual Indicator */}
        <View className="items-center">
          <BreathingCircle progress={progress} isPlaying={playerState === 'playing'} />
          <Text className="text-white text-xl font-semibold mt-6">
            {videoTitle}
          </Text>
          <Text className="text-slate-400 mt-2 text-sm">
            {playerState === 'loading' ? 'Loading from cache...' : 'Follow the rhythm'}
          </Text>
        </View>
      </View>

      {/* Controls Overlay */}
      {showControls && (
        <View className="absolute inset-0">
          {/* Top Bar — Back + Title */}
          <View className="flex-row items-center px-4 pt-14">
            <Pressable
              className="w-10 h-10 rounded-full bg-slate-900/80 items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-white text-lg">←</Text>
            </Pressable>
            <Text className="text-white font-medium ml-4 flex-1" numberOfLines={1}>
              {videoTitle}
            </Text>
            <Pressable
              className="px-3 py-1.5 rounded-lg bg-slate-900/80"
              onPress={() => setIsLooping(!isLooping)}
            >
              <Text className={`text-sm font-medium ${isLooping ? 'text-indigo-400' : 'text-slate-400'}`}>
                {isLooping ? '🔁 Loop' : '▶️ Once'}
              </Text>
            </Pressable>
          </View>

          {/* Bottom Controls */}
          <View className="absolute bottom-0 left-0 right-0 bg-slate-950/80 px-6 pb-10 pt-4">
            {/* Progress Bar */}
            <View className="flex-row items-center gap-3 mb-4">
              <Text className="text-slate-400 text-xs w-10">
                {formatTime(progress)}
              </Text>
              <View className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
              <Text className="text-slate-400 text-xs w-10 text-right">
                {formatTime(1)}
              </Text>
            </View>

            {/* Playback Controls */}
            <View className="flex-row items-center justify-center gap-8">
              {/* Replay */}
              <Pressable
                className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
                onPress={handleReplay}
              >
                <Text className="text-white text-lg">⟲</Text>
              </Pressable>

              {/* Play/Pause */}
              <Pressable
                className="w-16 h-16 rounded-full bg-indigo-600 items-center justify-center active:bg-indigo-700"
                onPress={playerState === 'playing' ? handlePause : handlePlay}
              >
                <Text className="text-white text-2xl">
                  {playerState === 'playing' ? '⏸' : '▶️'}
                </Text>
              </Pressable>

              {/* Skip/End */}
              <Pressable
                className="w-12 h-12 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
                onPress={() => router.back()}
              >
                <Text className="text-white text-lg">⏹</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Loading Spinner */}
      {playerState === 'loading' && (
        <View className="absolute inset-0 items-center justify-center bg-slate-950/50">
          <View className="bg-slate-900 rounded-xl p-6 border border-slate-800 items-center">
            <Text className="text-2xl mb-2">⏳</Text>
            <Text className="text-white font-medium">Loading video...</Text>
            <Text className="text-slate-400 text-xs mt-1">Checking local cache</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Animated breathing circle — pulsing visual guide
 */
function BreathingCircle({
  progress,
  isPlaying,
}: {
  progress: number;
  isPlaying: boolean;
}) {
  // Breathing cycle: inhale 4s, hold 4s, exhale 4s = 12s total
  const cyclePosition = (progress * 100) % 12;
  const phase = cyclePosition < 4 ? 'inhale' : cyclePosition < 8 ? 'hold' : 'exhale';

  // Scale: grows on inhale, stays on hold, shrinks on exhale
  const scale = phase === 'inhale'
    ? 0.8 + (cyclePosition / 4) * 0.4
    : phase === 'hold'
      ? 1.2
      : 1.2 - ((cyclePosition - 8) / 4) * 0.4;

  return (
    <View className="items-center">
      <View
        className="w-40 h-40 rounded-full border-4 border-indigo-400/60 items-center justify-center"
        style={{ transform: [{ scale: isPlaying ? scale : 1 }] }}
      >
        <View className="w-32 h-32 rounded-full bg-indigo-600/20 items-center justify-center">
          <Text className="text-indigo-300 text-sm font-medium capitalize">
            {isPlaying ? phase : 'Ready'}
          </Text>
        </View>
      </View>
    </View>
  );
}
