/**
 * Nutrition Pipeline types
 */
export interface Meal {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: Ingredient[];
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
  prepTimeMinutes: number;
  method: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface NutritionPlan {
  id: string;
  userId: string;
  planDate: string; // ISO date (YYYY-MM-DD)
  meals: Meal[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  generatedAt: string;
  regenerationCount: number;
}

/**
 * LLM output schema for nutrition generation
 */
export interface NutritionPlanLLMOutput {
  meals: Meal[];
}

/**
 * Brand guardrail — prohibited food categories
 * NEVER recommend these in any nutrition pipeline
 */
export const PROHIBITED_FOOD_CATEGORIES = [
  'commercial protein bars',
  'commercial protein powders',
  'commercial protein shakes',
  'clear protein drinks',
  'meal replacement shakes',
  'pre-packaged protein snacks',
  'heavily marketed branded snack products',
  'processed convenience foods',
] as const;
