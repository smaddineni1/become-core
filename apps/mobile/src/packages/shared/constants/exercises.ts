import type { ExerciseId } from '../types/workout';

export interface ExerciseInfo {
  id: ExerciseId;
  name: string;
  description: string;
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modelAsset: string; // GLTF file path
}

export const EXERCISES: Record<ExerciseId, ExerciseInfo> = {
  air_squat: {
    id: 'air_squat',
    name: 'Air Squat',
    description: 'A bodyweight squat with proper depth and form',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    difficulty: 'beginner',
    modelAsset: '/models/air-squat.glb',
  },
  push_up: {
    id: 'push_up',
    name: 'Push-Up',
    description: 'A full-range push-up with controlled tempo',
    muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
    difficulty: 'beginner',
    modelAsset: '/models/push-up.glb',
  },
  sit_up: {
    id: 'sit_up',
    name: 'Sit-Up',
    description: 'A controlled sit-up with full range of motion',
    muscleGroups: ['abdominals', 'hip_flexors'],
    difficulty: 'beginner',
    modelAsset: '/models/sit-up.glb',
  },
  kettlebell_swing: {
    id: 'kettlebell_swing',
    name: 'Kettlebell Swing',
    description: 'A hip-hinge powered kettlebell swing to eye level',
    muscleGroups: ['glutes', 'hamstrings', 'core', 'shoulders'],
    difficulty: 'intermediate',
    modelAsset: '/models/kettlebell-swing.glb',
  },
};

export const LAUNCH_EXERCISES: ExerciseId[] = [
  'air_squat',
  'push_up',
  'sit_up',
  'kettlebell_swing',
];
