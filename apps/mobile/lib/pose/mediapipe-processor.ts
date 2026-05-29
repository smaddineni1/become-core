/**
 * MediaPipe Pose Landmarker — On-Device Processing Pipeline
 *
 * Processes camera frames through MediaPipe Pose to extract 33 skeletal landmarks.
 * All processing happens on-device — zero video data leaves the phone.
 *
 * MediaPipe outputs normalized coordinates (0-1) for x, y and world coordinates
 * in meters for the z-axis (depth).
 */

import type { Landmark } from '@become/scoring';

/**
 * MediaPipe's 33 pose landmark indices
 * Reference: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
 */
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export type PoseLandmarkName = keyof typeof POSE_LANDMARKS;

/**
 * Raw pose result from MediaPipe
 */
export interface MediaPipePoseResult {
  landmarks: Array<{
    x: number;  // Normalized [0, 1] from left edge
    y: number;  // Normalized [0, 1] from top edge
    z: number;  // Depth in meters (relative to hip midpoint)
    visibility: number;  // Confidence [0, 1]
  }>;
  worldLandmarks: Array<{
    x: number;  // World coordinate in meters
    y: number;  // World coordinate in meters
    z: number;  // World coordinate in meters
    visibility: number;
  }>;
  timestamp: number;
}

/**
 * Processed pose frame — extracted landmarks mapped to scoring engine format
 */
export interface ProcessedPoseFrame {
  landmarks: Map<PoseLandmarkName, Landmark>;
  timestamp: number;
  confidence: number;  // Average visibility across key joints
}

/**
 * Extract named landmarks from MediaPipe result.
 * Converts raw index-based array to a named map usable by the scoring engine.
 */
export function extractLandmarks(
  result: MediaPipePoseResult,
): ProcessedPoseFrame {
  const landmarks = new Map<PoseLandmarkName, Landmark>();
  const keyJointIndices = [
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.RIGHT_KNEE,
    POSE_LANDMARKS.LEFT_ANKLE,
    POSE_LANDMARKS.RIGHT_ANKLE,
  ];

  let totalVisibility = 0;
  let keyJointCount = 0;

  for (const [name, index] of Object.entries(POSE_LANDMARKS)) {
    const worldLandmark = result.worldLandmarks[index];
    if (!worldLandmark) continue;

    landmarks.set(name as PoseLandmarkName, {
      x: worldLandmark.x,
      y: worldLandmark.y,
      z: worldLandmark.z,
      visibility: worldLandmark.visibility,
    });

    if (keyJointIndices.includes(index)) {
      totalVisibility += worldLandmark.visibility;
      keyJointCount++;
    }
  }

  return {
    landmarks,
    timestamp: result.timestamp,
    confidence: keyJointCount > 0 ? totalVisibility / keyJointCount : 0,
  };
}

/**
 * Calculate derived/virtual landmarks needed by the scoring engine.
 * E.g., MID_SHOULDER (midpoint of shoulders), MID_HIP, VERTICAL_REF
 */
export function computeDerivedLandmarks(
  frame: ProcessedPoseFrame,
): Map<string, Landmark> {
  const derived = new Map<string, Landmark>();

  const leftShoulder = frame.landmarks.get('LEFT_SHOULDER');
  const rightShoulder = frame.landmarks.get('RIGHT_SHOULDER');
  const leftHip = frame.landmarks.get('LEFT_HIP');
  const rightHip = frame.landmarks.get('RIGHT_HIP');

  // MID_SHOULDER — midpoint between shoulders
  if (leftShoulder && rightShoulder) {
    derived.set('MID_SHOULDER', {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
      z: (leftShoulder.z + rightShoulder.z) / 2,
    });
  }

  // MID_HIP — midpoint between hips
  if (leftHip && rightHip) {
    derived.set('MID_HIP', {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
      z: (leftHip.z + rightHip.z) / 2,
    });
  }

  // VERTICAL_REF — a point directly below MID_HIP (for torso lean calculation)
  const midHip = derived.get('MID_HIP');
  if (midHip) {
    derived.set('VERTICAL_REF', {
      x: midHip.x,
      y: midHip.y + 0.5, // 50cm below hip (pointing down)
      z: midHip.z,
    });
  }

  return derived;
}

/**
 * Map landmarks to the string-keyed format expected by the scoring engine.
 * Scoring profiles reference landmarks by string name (e.g., 'LEFT_HIP').
 */
export function toLandmarkRecord(
  frame: ProcessedPoseFrame,
): Record<string, Landmark> {
  const record: Record<string, Landmark> = {};

  for (const [name, landmark] of frame.landmarks) {
    record[name] = landmark;
  }

  // Add derived landmarks
  const derived = computeDerivedLandmarks(frame);
  for (const [name, landmark] of derived) {
    record[name] = landmark;
  }

  return record;
}

/**
 * Minimum confidence threshold for reliable scoring.
 * Below this, we should show a "position yourself in frame" message.
 */
export const MIN_CONFIDENCE_THRESHOLD = 0.6;

/**
 * Check if the user is positioned well enough for scoring.
 */
export function isPoseReliable(frame: ProcessedPoseFrame): boolean {
  return frame.confidence >= MIN_CONFIDENCE_THRESHOLD;
}
