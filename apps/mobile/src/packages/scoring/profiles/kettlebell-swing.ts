import type { ExerciseProfile } from '../types';

export const KETTLEBELL_SWING_PROFILE: ExerciseProfile = {
  exercise: 'kettlebell_swing',
  phases: ['standing', 'descent', 'bottom', 'ascent'],
  targetJoints: {
    hip_hinge: { landmarks: ['LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_KNEE'] },
    knee_bend: { landmarks: ['LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE'] },
    arm_extension: { landmarks: ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST'] },
  },
  idealRanges: {
    standing: {
      hip_hinge: { min: 160, max: 180 },
      arm_extension: { min: 150, max: 180 },
    },
    bottom: {
      hip_hinge: { min: 60, max: 100 },
      knee_bend: { min: 130, max: 170 }, // Knees stay relatively straight
    },
  },
  cues: [
    {
      cue: 'knee_cave',
      joint: 'knee_bend',
      condition: 'below',
      threshold: 120,
      message: 'Keep knees soft, not deeply bent — this is a hip hinge',
    },
    {
      cue: 'forward_lean',
      joint: 'hip_hinge',
      condition: 'below',
      threshold: 50,
      message: 'Hinge at hips — don\'t round your back',
    },
  ],
  transitions: [
    { from: 'standing', to: 'descent', trigger: { joint: 'hip_hinge', condition: 'below', angleDeg: 150 } },
    { from: 'descent', to: 'bottom', trigger: { joint: 'hip_hinge', condition: 'below', angleDeg: 100 } },
    { from: 'bottom', to: 'ascent', trigger: { joint: 'hip_hinge', condition: 'above', angleDeg: 100 } },
    { from: 'ascent', to: 'standing', trigger: { joint: 'hip_hinge', condition: 'above', angleDeg: 160 } },
  ],
  minScoreForValidRep: 60,
};
