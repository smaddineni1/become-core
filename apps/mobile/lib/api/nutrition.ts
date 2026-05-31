/**
 * Nutrition API — Client-side functions for meal plan operations
 */
import type { NutritionPlan } from '@app/packages/shared';
import { supabase } from '../supabase';

const FUNCTIONS_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

/**
 * Generate (or regenerate) today's meal plan
 */
export async function generateMealPlan(
  regenerate: boolean = false,
): Promise<{ success: boolean; plan?: NutritionPlan; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  const response = await fetch(`${FUNCTIONS_URL}/functions/v1/generate-meal-plan`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ regenerate }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.error ?? 'Failed to generate plan' };
  }

  return { success: true, plan: data.plan };
}

/**
 * Fetch today's meal plan from the database
 */
export async function getTodaysMealPlan(): Promise<NutritionPlan | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('nutrition_plans')
    .select('*')
    .eq('plan_date', today)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    planDate: data.plan_date,
    meals: data.meals,
    totalCalories: data.total_calories,
    totalProteinG: data.total_protein_g,
    totalCarbsG: data.total_carbs_g,
    totalFatG: data.total_fat_g,
    generatedAt: data.generated_at,
    regenerationCount: data.regeneration_count,
  };
}
