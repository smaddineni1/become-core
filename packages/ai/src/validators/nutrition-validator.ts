import type { Meal, NutritionPlanLLMOutput } from '@become/shared';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: NutritionPlanLLMOutput;
}

/**
 * Validate LLM nutrition output against our schema and brand guardrails.
 * Returns structured validation result with specific error messages.
 */
export function validateNutritionPlanOutput(raw: unknown): ValidationResult {
  const errors: string[] = [];

  // Basic structure check
  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: ['Response is not a valid object'] };
  }

  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj['meals'])) {
    return { valid: false, errors: ['Missing or invalid "meals" array'] };
  }

  const meals = obj['meals'] as unknown[];

  // Must have 3 meals + 1 snack minimum
  if (meals.length < 4) {
    errors.push(`Expected at least 4 meals, got ${meals.length}`);
  }

  // Validate each meal
  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i] as Record<string, unknown>;
    const prefix = `meals[${i}]`;

    if (!meal['name'] || typeof meal['name'] !== 'string') {
      errors.push(`${prefix}: missing name`);
    }

    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal['type'] as string)) {
      errors.push(`${prefix}: invalid type "${meal['type']}"`);
    }

    if (!Array.isArray(meal['ingredients']) || meal['ingredients'].length < 2) {
      errors.push(`${prefix}: must have at least 2 ingredients`);
    }

    // Validate macros are numbers
    for (const field of ['proteinG', 'carbsG', 'fatG', 'calories', 'prepTimeMinutes']) {
      if (typeof meal[field] !== 'number' || meal[field] < 0) {
        errors.push(`${prefix}: ${field} must be a positive number`);
      }
    }

    // Macro consistency check (~10% tolerance)
    if (typeof meal['proteinG'] === 'number' && typeof meal['carbsG'] === 'number' &&
        typeof meal['fatG'] === 'number' && typeof meal['calories'] === 'number') {
      const calculated = (meal['proteinG'] as number) * 4 + (meal['carbsG'] as number) * 4 + (meal['fatG'] as number) * 9;
      const stated = meal['calories'] as number;
      if (stated > 0 && Math.abs(calculated - stated) / stated > 0.15) {
        errors.push(`${prefix}: macro/calorie mismatch (calculated ${Math.round(calculated)}, stated ${stated})`);
      }
    }

    // Brand guardrail check — scan ingredients for prohibited items
    if (Array.isArray(meal['ingredients'])) {
      for (const ing of meal['ingredients'] as Array<Record<string, unknown>>) {
        const name = ((ing['name'] as string) ?? '').toLowerCase();
        if (containsProhibitedFood(name)) {
          errors.push(`${prefix}: BRAND VIOLATION — prohibited ingredient "${ing['name']}"`);
        }
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], data: obj as unknown as NutritionPlanLLMOutput };
}

const PROHIBITED_PATTERNS = [
  /protein bar/i,
  /protein shake/i,
  /protein powder/i,
  /whey protein/i,
  /casein protein/i,
  /meal replacement/i,
  /clear protein/i,
  /protein drink/i,
  /quest\b/i,
  /rxbar/i,
  /clif\b/i,
  /kind bar/i,
  /huel/i,
  /soylent/i,
  /muscle milk/i,
  /premier protein/i,
  /optimum nutrition/i,
  /ghost protein/i,
  /isopure/i,
  /protein2o/i,
  /built bar/i,
  /one bar/i,
];

function containsProhibitedFood(name: string): boolean {
  return PROHIBITED_PATTERNS.some((pattern) => pattern.test(name));
}
