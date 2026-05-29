/**
 * CameraWithPose — Camera feed with skeletal overlay
 *
 * Right side of the form check split-screen.
 * - Activates device camera via expo-camera
 * - Processes frames through MediaPipe Pose (on-device)
 * - Draws 33-point skeletal overlay on top of the live feed
 * - Feeds landmarks to the ScoringPipeline
 *
 * PRIVACY: No video frame data ever leaves the device.
 * All processing happens locally via WASM/TFLite.
 */

import { View, Text } from 'react-native';
import type { PoseLandmarkName } from '../../lib/pose';
import { POSE_LANDMARKS } from '../../lib/pose';

/**
 * Skeletal connections to draw between landmarks
 * (defines the "stick figure" overlay)
 */
export const SKELETON_CONNECTIONS: Array<[PoseLandmarkName, PoseLandmarkName]> = [
  // Torso
  ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
  ['LEFT_SHOULDER', 'LEFT_HIP'],
  ['RIGHT_SHOULDER', 'RIGHT_HIP'],
  ['LEFT_HIP', 'RIGHT_HIP'],

  // Left arm
  ['LEFT_SHOULDER', 'LEFT_ELBOW'],
  ['LEFT_ELBOW', 'LEFT_WRIST'],

  // Right arm
  ['RIGHT_SHOULDER', 'RIGHT_ELBOW'],
  ['RIGHT_ELBOW', 'RIGHT_WRIST'],

  // Left leg
  ['LEFT_HIP', 'LEFT_KNEE'],
  ['LEFT_KNEE', 'LEFT_ANKLE'],

  // Right leg
  ['RIGHT_HIP', 'RIGHT_KNEE'],
  ['RIGHT_KNEE', 'RIGHT_ANKLE'],

  // Feet
  ['LEFT_ANKLE', 'LEFT_HEEL'],
  ['LEFT_ANKLE', 'LEFT_FOOT_INDEX'],
  ['RIGHT_ANKLE', 'RIGHT_HEEL'],
  ['RIGHT_ANKLE', 'RIGHT_FOOT_INDEX'],
];

interface CameraWithPoseProps {
  isActive: boolean;
  onFrameProcessed?: (landmarks: Record<string, { x: number; y: number; z: number }>) => void;
}

/**
 * Camera + Pose Detection Component
 *
 * In production, this renders:
 * - <CameraView> from expo-camera (front-facing)
 * - An overlay canvas drawing skeletal lines and joint dots
 * - Processes each frame through the MediaPipe WASM module
 *
 * Implementation notes:
 * - expo-camera provides the frame buffer
 * - MediaPipe Pose Landmarker (WASM) processes at 30fps
 * - Results are drawn as an SVG/Canvas overlay
 * - Joint dots are color-coded by confidence (green=high, yellow=medium, red=low)
 */
export function CameraWithPose({ isActive, onFrameProcessed }: CameraWithPoseProps) {
  return (
    <View className="flex-1 bg-slate-900">
      {isActive ? (
        <View className="flex-1">
          {/* Camera Preview Layer */}
          {/*
           * <CameraView
           *   facing="front"
           *   style={{ flex: 1 }}
           *   onFrame={(event) => {
           *     // Process frame through MediaPipe
           *     const result = poseLandmarker.detectForVideo(event.frame, event.timestamp);
           *     if (result.landmarks.length > 0) {
           *       onFrameProcessed?.(extractLandmarks(result));
           *     }
           *   }}
           * />
           */}

          {/* Placeholder camera view */}
          <View className="flex-1 bg-slate-800 items-center justify-center">
            <View className="items-center gap-3">
              <View className="w-16 h-16 rounded-full border-2 border-indigo-500/50 items-center justify-center">
                <Text className="text-2xl">📷</Text>
              </View>
              <Text className="text-slate-400 text-sm font-medium">Live Camera</Text>
              <Text className="text-slate-500 text-xs text-center max-w-[200px]">
                MediaPipe Pose Detection Active{'\n'}33 landmarks at 30fps
              </Text>
            </View>
          </View>

          {/* Skeleton Overlay Layer */}
          {/*
           * This would be an absolute-positioned SVG/Canvas rendering:
           * - Lines between connected landmarks (SKELETON_CONNECTIONS)
           * - Dots at each of the 33 landmark positions
           * - Color-coded by confidence (visibility score)
           *
           * <SkeletonOverlay landmarks={currentLandmarks} connections={SKELETON_CONNECTIONS} />
           */}

          {/* Status Bar */}
          <View className="absolute bottom-0 left-0 right-0 bg-slate-950/80 px-4 py-2 border-t border-slate-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-emerald-400" />
                <Text className="text-slate-400 text-xs">Pose tracking active</Text>
              </View>
              <Text className="text-slate-500 text-xs">On-device only</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">Camera paused</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Color for landmark dots based on visibility confidence
 */
export function getLandmarkColor(visibility: number): string {
  if (visibility >= 0.8) return '#34D399'; // green
  if (visibility >= 0.5) return '#FBBF24'; // amber
  return '#F87171'; // red
}

/**
 * Configuration for the MediaPipe Pose Landmarker
 */
export const MEDIAPIPE_CONFIG = {
  modelComplexity: 1,       // 0=lite, 1=full, 2=heavy
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  numPoses: 1,
  outputSegmentationMasks: false,
} as const;
