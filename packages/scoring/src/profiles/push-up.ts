import type { ExerciseProfile } from '../types.js';

export const PUSH_UP_PROFILE: ExerciseProfile = {
  exercise: 'push_up',
  phases: ['start', 'descent', 'bottom', 'ascent'],
  targetJoints: {
    left_elbow: { landmarks: ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST'] },
    right_elbow: { landmarks: ['RIGHT_SHOULDER', 'RIGHT_ELBOW', 'RIGHT_WRIST'] },
    left_shoulder: { landmarks: ['LEFT_ELBOW', 'LEFT_SHOULDER', 'LEFT_HIP'] },
    body_line: { landmarks: ['LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_ANKLE'] },
  },
  idealRanges: {
    start: {
      left_elbow: { min: 160, max: 180 },
      body_line: { min: 165, max: 180 },
    },
    bottom: {
      left_elbow: { min: 70, max: 100 },
      right_elbow: { min: 70, max: 100 },
      body_line: { min: 165, max: 180 },
    },
  },
  cues: [
    {
      cue: 'deficient_depth',
      joint: 'left_elbow',
      condition: 'above',
      threshold: 110,
      message: 'Go lower — elbows to 90°',
    },
    {
      cue: 'forward_lean',
      joint: 'body_line',
      condition: 'below',
      threshold: 155,
      message: 'Keep hips in line — avoid sagging',
    },
  ],
  transitions: [
    { from: 'start', to: 'descent', trigger: { joint: 'left_elbow', condition: 'below', angleDeg: 150 } },
    { from: 'descent', to: 'bottom', trigger: { joint: 'left_elbow', condition: 'below', angleDeg: 110 } },
    { from: 'bottom', to: 'ascent', trigger: { joint: 'left_elbow', condition: 'above', angleDeg: 110 } },
    { from: 'ascent', to: 'start', trigger: { joint: 'left_elbow', condition: 'above', angleDeg: 160 } },
  ],
  minScoreForValidRep: 60,
};
