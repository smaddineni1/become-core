import type { ExerciseId } from '../shared';
import type { ExerciseProfile } from '../types';
import { AIR_SQUAT_PROFILE } from './air-squat';
import { PUSH_UP_PROFILE } from './push-up';
import { SIT_UP_PROFILE } from './sit-up';
import { KETTLEBELL_SWING_PROFILE } from './kettlebell-swing';

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
