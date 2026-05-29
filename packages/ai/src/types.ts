import type {
  ActivityLevel,
  DietaryPreference,
  FitnessGoal,
  HRVClassification,
} from '@become/shared';

export interface NutritionPromptContext {
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietaryPreferences: DietaryPreference[];
  heightCm: number;
  weightKg: number;
  age: number;
  sex: 'male' | 'female' | 'other';
  targetCalories?: number;
}

export interface GeniePromptContext {
  displayName: string;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  hrvClassification: HRVClassification | null;
  lastWorkout: string | null;
  lastMealPlanDate: string | null;
  recentSessions: string[];
}
