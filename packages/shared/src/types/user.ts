/**
 * User Profile — extends Supabase auth.users
 */
export type FitnessGoal = 'lose_fat' | 'build_muscle' | 'improve_mobility' | 'reduce_stress';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'gluten_free'
  | 'dairy_free';

export type SubscriptionTier = 'free' | 'premium';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  email: string;
  age: number | null;
  sex: 'male' | 'female' | 'other' | null;
  heightCm: number | null;
  weightKg: number | null;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietaryPreferences: DietaryPreference[];
  onboardingCompletedAt: string | null;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingQuizInput {
  age: number;
  sex: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietaryPreferences: DietaryPreference[];
}
