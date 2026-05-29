import type { ExerciseProfile } from '../types.js';

export const AIR_SQUAT_PROFILE: ExerciseProfile = {
  exercise: 'air_squat',
  phases: ['standing', 'descent', 'bottom', 'ascent'],
  targetJoints: {
    left_knee: { landmarks: ['LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE'] },
    right_knee: { landmarks: ['RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE'] },
    left_hip: { landmarks: ['LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_KNEE'] },
    right_hip: { landmarks: ['RIGHT_SHOULDER', 'RIGHT_HIP', 'RIGHT_KNEE'] },
    torso_lean: { landmarks: ['MID_SHOULDER', 'MID_HIP', 'VERTICAL_REF'] },
  },
  idealRanges: {
    standing: {
      left_knee: { min: 160, max: 180 },
      left_hip: { min: 160, max: 180 },
    },
    bottom: {
      left_knee: { min: 70, max: 100 },
      right_knee: { min: 70, max: 100 },
      left_hip: { min: 60, max: 90 },
      right_hip: { min: 60, max: 90 },
      torso_lean: { min: 0, max: 30 },
    },
  },
  cues: [
    {
      cue: 'knee_cave',
      joint: 'knee_valgus',
      condition: 'above',
      threshold: 10,
      message: 'Keep knees tracking over toes',
    },
    {
      cue: 'deficient_depth',
      joint: 'left_hip',
      condition: 'above',
      threshold: 100,
      message: 'Go deeper — hips below knees',
    },
    {
      cue: 'forward_lean',
      joint: 'torso_lean',
      condition: 'above',
      threshold: 35,
      message: 'Keep chest upright',
    },
  ],
  transitions: [
    { from: 'standing', to: 'descent', trigger: { joint: 'left_knee', condition: 'below', angleDeg: 150 } },
    { from: 'descent', to: 'bottom', trigger: { joint: 'left_knee', condition: 'below', angleDeg: 110 } },
    { from: 'bottom', to: 'ascent', trigger: { joint: 'left_knee', condition: 'above', angleDeg: 110 } },
    { from: 'ascent', to: 'standing', trigger: { joint: 'left_knee', condition: 'above', angleDeg: 160 } },
  ],
  minScoreForValidRep: 60,
};
