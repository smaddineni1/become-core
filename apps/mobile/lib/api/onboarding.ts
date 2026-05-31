/**
 * Onboarding API — Quiz & Scan persistence
 */
import type { OnboardingQuizInput } from '@app/packages/shared';
import { supabase } from '../supabase';

/**
 * Persist quiz responses to user_profiles table.
 * Called after quiz completion, before scan begins.
 */
export async function saveQuizResponses(
  userId: string,
  quiz: OnboardingQuizInput,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      age: quiz.age,
      sex: quiz.sex,
      height_cm: quiz.heightCm,
      weight_kg: quiz.weightKg,
      fitness_goal: quiz.fitnessGoal,
      activity_level: quiz.activityLevel,
      dietary_preferences: quiz.dietaryPreferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Persist biometric scan results to user_biometric_profiles table.
 * Called after scan completes successfully.
 */
export async function saveScanResults(
  userId: string,
  measurements: Record<string, number>,
  provider: string = 'simulation',
  confidence: number = 0.85,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_biometric_profiles')
    .insert({
      user_id: userId,
      provider,
      measurements,
      confidence,
      scanned_at: new Date().toISOString(),
    });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Mark onboarding as completed on the user profile.
 * Called after the celebration screen CTA.
 */
export async function markOnboardingComplete(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
