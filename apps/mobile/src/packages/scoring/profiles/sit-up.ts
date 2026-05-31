import type { ExerciseProfile } from '../types';

export const SIT_UP_PROFILE: ExerciseProfile = {
  exercise: 'sit_up',
  phases: ['start', 'up', 'descent'],
  targetJoints: {
    torso_angle: { landmarks: ['LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_KNEE'] },
    hip_angle: { landmarks: ['LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_ANKLE'] },
  },
  idealRanges: {
    start: {
      torso_angle: { min: 150, max: 180 },
    },
    up: {
      torso_angle: { min: 40, max: 80 },
    },
  },
  cues: [
    {
      cue: 'deficient_depth',
      joint: 'torso_angle',
      condition: 'above',
      threshold: 90,
      message: 'Come up higher — full sit-up',
    },
  ],
  transitions: [
    { from: 'start', to: 'up', trigger: { joint: 'torso_angle', condition: 'below', angleDeg: 100 } },
    { from: 'up', to: 'descent', trigger: { joint: 'torso_angle', condition: 'above', angleDeg: 100 } },
    { from: 'descent', to: 'start', trigger: { joint: 'torso_angle', condition: 'above', angleDeg: 150 } },
  ],
  minScoreForValidRep: 60,
};
