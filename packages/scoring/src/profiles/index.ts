import type { ExerciseId } from '@become/shared';
import type { ExerciseProfile } from '../types.js';
import { AIR_SQUAT_PROFILE } from './air-squat.js';
import { PUSH_UP_PROFILE } from './push-up.js';
import { SIT_UP_PROFILE } from './sit-up.js';
import { KETTLEBELL_SWING_PROFILE } from './kettlebell-swing.js';

const PROFILES: Record<ExerciseId, ExerciseProfile> = {
  air_squat: AIR_SQUAT_PROFILE,
  push_up: PUSH_UP_PROFILE,
  sit_up: SIT_UP_PROFILE,
  kettlebell_swing: KETTLEBELL_SWING_PROFILE,
};

/**
 * Get the exercise scoring profile for a given exercise ID
 */
export function getProfile(exerciseId: ExerciseId): ExerciseProfile {
  const profile = PROFILES[exerciseId];
  if (!profile) {
    throw new Error(`No scoring profile found for exercise: ${exerciseId}`);
  }
  return profile;
}
