import type { NutritionPromptContext } from '../types.js';
import { BRAND_GUARDRAIL_BLOCK } from '../guardrails/brand.js';

/**
 * System prompt for the nutrition pipeline.
 * Used with GPT-4o in JSON mode.
 */
export const NUTRITION_SYSTEM_PROMPT = `
You are the Become nutrition engine — a world-class whole-food sports dietitian.
Your role is to generate a complete daily meal plan for a user based on their profile.

${BRAND_GUARDRAIL_BLOCK}

OUTPUT FORMAT:
You MUST respond with valid JSON matching this exact schema:
{
  "meals": [
    {
      "name": "Meal name",
      "type": "breakfast" | "lunch" | "dinner" | "snack",
      "ingredients": [
        { "name": "ingredient", "quantity": "200", "unit": "g" }
      ],
      "proteinG": 30,
      "carbsG": 45,
      "fatG": 12,
      "calories": 410,
      "prepTimeMinutes": 15,
      "method": "Brief 2-3 sentence preparation method"
    }
  ]
}

RULES:
- Generate exactly 3 main meals (breakfast, lunch, dinner) and 1 snack
- Each meal must have at least 2 ingredients
- All macros must be realistic and mathematically consistent (protein*4 + carbs*4 + fat*9 ≈ calories ± 10%)
- Prep times must be realistic for home cooking
- Methods must be clear enough for a beginner cook
- Meals must be varied — don't repeat the same protein source more than twice in a day
- Respect the user's dietary preferences strictly
`.trim();

/**
 * Build the user-specific prompt with their nutritional context
 */
export function buildNutritionUserPrompt(ctx: NutritionPromptContext): string {
  const bmr = estimateBMR(ctx);
  const tdee = estimateTDEE(bmr, ctx.activityLevel);
  const targetCalories = ctx.targetCalories ?? calculateTargetCalories(tdee, ctx.fitnessGoal);

  const macroSplit = getMacroSplit(ctx.fitnessGoal);

  return `
Generate a daily meal plan for this user:

PROFILE:
- Age: ${ctx.age}
- Sex: ${ctx.sex}
- Height: ${ctx.heightCm}cm
- Weight: ${ctx.weightKg}kg
- Fitness Goal: ${ctx.fitnessGoal.replace('_', ' ')}
- Activity Level: ${ctx.activityLevel.replace('_', ' ')}
- Dietary Preferences: ${ctx.dietaryPreferences.length > 0 ? ctx.dietaryPreferences.join(', ') : 'none (omnivore)'}

TARGETS:
- Daily Calories: ~${targetCalories} kcal
- Protein: ~${macroSplit.proteinG}g (${macroSplit.proteinPct}%)
- Carbs: ~${macroSplit.carbsG}g (${macroSplit.carbsPct}%)
- Fat: ~${macroSplit.fatG}g (${macroSplit.fatPct}%)

Generate the meal plan now.
  `.trim();
}

// --- Internal helpers ---

function estimateBMR(ctx: NutritionPromptContext): number {
  // Mifflin-St Jeor equation
  const base = 10 * ctx.weightKg + 6.25 * ctx.heightCm - 5 * ctx.age;
  return ctx.sex === 'male' ? base + 5 : base - 161;
}

function estimateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  return Math.round(bmr * (multipliers[activityLevel] ?? 1.375));
}

function calculateTargetCalories(tdee: number, goal: string): number {
  switch (goal) {
    case 'lose_fat': return Math.round(tdee * 0.8); // 20% deficit
    case 'build_muscle': return Math.round(tdee * 1.1); // 10% surplus
    default: return tdee; // maintenance
  }
}

function getMacroSplit(goal: string) {
  // Returns macro percentages and approximate grams for a 2000 cal baseline
  switch (goal) {
    case 'lose_fat':
      return { proteinPct: 35, carbsPct: 35, fatPct: 30, proteinG: 150, carbsG: 150, fatG: 55 };
    case 'build_muscle':
      return { proteinPct: 30, carbsPct: 45, fatPct: 25, proteinG: 160, carbsG: 240, fatG: 60 };
    default:
      return { proteinPct: 25, carbsPct: 45, fatPct: 30, proteinG: 125, carbsG: 225, fatG: 65 };
  }
}
