/**
 * Edge Function: generate-meal-plan
 *
 * Generates a personalized daily whole-food meal plan using GPT-4o.
 * Enforces brand guardrails via system prompt + output validation.
 *
 * Pipeline:
 * 1. Authenticate user via JWT
 * 2. Fetch user profile + biometric data
 * 3. Build nutrition prompt with caloric targets + guardrails
 * 4. Call GPT-4o (JSON mode, structured output)
 * 5. Validate response with nutrition validator
 * 6. Retry up to 3x on validation failure
 * 7. Store validated plan in nutrition_plans table
 * 8. Return plan to client (or trigger push notification for cron)
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_RETRIES = 3;

// Brand guardrail system prompt — injected into every nutrition call
const NUTRITION_SYSTEM_PROMPT = `
You are the Become nutrition engine — a world-class whole-food sports dietitian.
Your role is to generate a complete daily meal plan for a user based on their profile.

STRICT NUTRITION CONSTRAINTS (NEVER VIOLATE — THESE ARE ABSOLUTE):

You are a whole-food nutrition expert. Every single food recommendation you make MUST be:
- A whole, minimally processed food ingredient
- Preparable from raw ingredients in a home kitchen
- Real food that you could find at a farmer's market or grocery store's produce/meat/dairy section

You are ABSOLUTELY PROHIBITED from recommending any of the following — this list is NON-NEGOTIABLE:
- Commercial protein bars (Quest, Kind, RXBar, Clif, Built Bar, ONE Bar, etc.)
- Commercial protein powders or shakes (Optimum Nutrition, Ghost, Dymatize, Muscle Milk, etc.)
- Clear protein drinks (Protein2O, Premier Protein Clear, Isopure, etc.)
- Meal replacement shakes (Huel, Soylent, AG1, etc.)
- Pre-packaged protein snacks (jerky brands, protein chips, etc.)
- Any heavily marketed branded "fitness" food product
- Pre-made smoothie mixes or supplement drinks
- Any food item where the brand name is the selling point

APPROVED protein sources ONLY: eggs, Greek yogurt, cottage cheese, chicken breast, turkey,
salmon, tuna, cod, shrimp, beef, bison, lamb, pork, tofu, tempeh, edamame, lentils,
chickpeas, black beans, kidney beans, quinoa, hemp seeds, chia seeds, pumpkin seeds,
almonds, walnuts, peanut butter (natural), tahini.

OUTPUT FORMAT (STRICT JSON):
{
  "meals": [
    {
      "name": "Meal name",
      "type": "breakfast" | "lunch" | "dinner" | "snack",
      "ingredients": [{ "name": "ingredient", "quantity": "200", "unit": "g" }],
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
- All macros must be realistic and mathematically consistent
- Prep times must be realistic for home cooking
- Methods must be clear enough for a beginner cook
- Meals must be varied — don't repeat the same protein source more than twice
- Respect the user's dietary preferences strictly
`.trim();

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid token' }, 401, corsHeaders);
    }

    // 2. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: 'Profile not found' }, 404, corsHeaders);
    }

    // 3. Check regeneration limit for free users
    const body = await req.json().catch(() => ({}));
    const isRegeneration = body.regenerate === true;

    if (profile.subscription_tier === 'free' && isRegeneration) {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingPlan } = await supabase
        .from('nutrition_plans')
        .select('regeneration_count')
        .eq('user_id', user.id)
        .eq('plan_date', today)
        .single();

      if (existingPlan && existingPlan.regeneration_count >= 1) {
        return jsonResponse(
          { error: 'Free tier limited to 1 regeneration per day. Upgrade to Premium for unlimited.' },
          429,
          corsHeaders,
        );
      }
    }

    // 4. Build user context prompt
    const userPrompt = buildUserPrompt(profile);

    // 5. Call GPT-4o with retries
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return jsonResponse({ error: 'AI service not configured' }, 500, corsHeaders);
    }

    let validatedPlan = null;
    let lastErrors: string[] = [];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const llmResponse = await callGPT4o(openaiKey, userPrompt, attempt > 1 ? lastErrors : undefined);

      if (!llmResponse) {
        lastErrors = ['GPT-4o returned empty response'];
        continue;
      }

      // 6. Validate output
      const validation = validateMealPlan(llmResponse);
      if (validation.valid) {
        validatedPlan = llmResponse;
        break;
      } else {
        lastErrors = validation.errors;
      }
    }

    if (!validatedPlan) {
      return jsonResponse(
        { error: 'Failed to generate valid meal plan after 3 attempts', details: lastErrors },
        500,
        corsHeaders,
      );
    }

    // 7. Calculate totals
    const totals = calculateTotals(validatedPlan.meals);

    // 8. Store in database
    const today = new Date().toISOString().split('T')[0];
    const { data: savedPlan, error: saveError } = await supabase
      .from('nutrition_plans')
      .upsert(
        {
          user_id: user.id,
          plan_date: today,
          meals: validatedPlan.meals,
          total_calories: totals.calories,
          total_protein_g: totals.proteinG,
          total_carbs_g: totals.carbsG,
          total_fat_g: totals.fatG,
          generated_at: new Date().toISOString(),
          regeneration_count: isRegeneration ? 1 : 0,
        },
        { onConflict: 'user_id,plan_date' },
      )
      .select()
      .single();

    if (saveError) {
      return jsonResponse({ error: 'Failed to save plan', details: saveError.message }, 500, corsHeaders);
    }

    return jsonResponse({ success: true, plan: savedPlan }, 200, corsHeaders);
  } catch (error) {
    return jsonResponse(
      { error: 'Internal server error', details: String(error) },
      500,
      corsHeaders,
    );
  }
});

// ----- Helpers -----

async function callGPT4o(
  apiKey: string,
  userPrompt: string,
  previousErrors?: string[],
): Promise<any | null> {
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: NUTRITION_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  if (previousErrors && previousErrors.length > 0) {
    messages.push({
      role: 'user',
      content: `Your previous response had validation errors: ${previousErrors.join('; ')}. Please fix these issues and regenerate.`,
    });
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function buildUserPrompt(profile: any): string {
  const heightM = (profile.height_cm ?? 170) / 100;
  const weight = profile.weight_kg ?? 70;
  const age = profile.age ?? 30;
  const sex = profile.sex ?? 'other';
  const goal = profile.fitness_goal ?? 'improve_mobility';
  const activity = profile.activity_level ?? 'moderately_active';
  const dietary = Array.isArray(profile.dietary_preferences)
    ? profile.dietary_preferences.join(', ')
    : 'none (omnivore)';

  // Mifflin-St Jeor BMR
  const bmr = sex === 'male'
    ? 10 * weight + 6.25 * (heightM * 100) - 5 * age + 5
    : 10 * weight + 6.25 * (heightM * 100) - 5 * age - 161;

  const multipliers: Record<string, number> = {
    sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725,
  };
  const tdee = Math.round(bmr * (multipliers[activity] ?? 1.375));

  const targetCalories = goal === 'lose_fat'
    ? Math.round(tdee * 0.8)
    : goal === 'build_muscle'
      ? Math.round(tdee * 1.1)
      : tdee;

  return `
Generate a daily meal plan for this user:

PROFILE:
- Age: ${age}
- Sex: ${sex}
- Height: ${Math.round(heightM * 100)}cm
- Weight: ${weight}kg
- Fitness Goal: ${goal.replace('_', ' ')}
- Activity Level: ${activity.replace('_', ' ')}
- Dietary Preferences: ${dietary || 'none (omnivore)'}

TARGET: ~${targetCalories} kcal/day

Generate the meal plan now as JSON.
  `.trim();
}

function validateMealPlan(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data?.meals || !Array.isArray(data.meals)) {
    return { valid: false, errors: ['Missing meals array'] };
  }

  if (data.meals.length < 4) {
    errors.push(`Expected at least 4 meals, got ${data.meals.length}`);
  }

  const PROHIBITED_PATTERNS = [
    /protein bar/i, /protein shake/i, /protein powder/i, /whey/i,
    /casein/i, /meal replacement/i, /clear protein/i, /quest\b/i,
    /rxbar/i, /clif\b/i, /kind bar/i, /huel/i, /soylent/i,
    /muscle milk/i, /premier protein/i, /optimum nutrition/i,
    /ghost protein/i, /isopure/i, /protein2o/i, /built bar/i,
  ];

  for (let i = 0; i < data.meals.length; i++) {
    const meal = data.meals[i];
    if (!meal.name) errors.push(`meals[${i}]: missing name`);
    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.type)) {
      errors.push(`meals[${i}]: invalid type`);
    }
    if (!Array.isArray(meal.ingredients) || meal.ingredients.length < 2) {
      errors.push(`meals[${i}]: needs at least 2 ingredients`);
    }

    // Brand guardrail check
    if (Array.isArray(meal.ingredients)) {
      for (const ing of meal.ingredients) {
        const name = (ing.name ?? '').toLowerCase();
        if (PROHIBITED_PATTERNS.some((p) => p.test(name))) {
          errors.push(`meals[${i}]: BRAND VIOLATION — "${ing.name}"`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function calculateTotals(meals: any[]): { calories: number; proteinG: number; carbsG: number; fatG: number } {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories ?? 0),
      proteinG: acc.proteinG + (meal.proteinG ?? 0),
      carbsG: acc.carbsG + (meal.carbsG ?? 0),
      fatG: acc.fatG + (meal.fatG ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

function jsonResponse(data: any, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
