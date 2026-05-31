/**
 * Recommendation Router
 *
 * Intercepts the daily wellness plan based on the Readiness Score.
 * If readiness is LOW (stressed), dynamically:
 * 1. Routes user to Guided Breathing session instead of a workout
 * 2. Triggers recovery-optimized nutrition generation
 * 3. Adjusts Genie's tone and suggestions
 *
 * If readiness is HIGH (recovered), routes to form check.
 * If BALANCED, suggests moderate activity (yoga).
 */

import type { ReadinessScore } from './readiness-engine';
import type { MindfulnessSession } from '@app/packages/shared';

export interface DailyRecommendation {
  readiness: ReadinessScore;
  primaryAction: RecommendedAction;
  nutritionOverride: NutritionOverride | null;
  breathingSession: MindfulnessSession | null;
  genieContext: string;
}

export interface RecommendedAction {
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NutritionOverride {
  focus: 'recovery' | 'performance' | 'maintenance';
  extraPromptInstructions: string;
  adjustedCaloriePct: number; // 1.0 = no change, 0.9 = 10% deficit, 1.05 = 5% surplus
}

/**
 * Route the user's daily plan based on their readiness score.
 * Called when user opens app or navigates to Home screen.
 */
export function routeByReadiness(readinessScore: ReadinessScore): DailyRecommendation {
  switch (readinessScore.classification) {
    case 'stressed':
      return buildRecoveryRoute(readinessScore);
    case 'balanced':
      return buildBalancedRoute(readinessScore);
    case 'recovered':
      return buildPerformanceRoute(readinessScore);
  }
}

// ----- Route Builders -----

function buildRecoveryRoute(readiness: ReadinessScore): DailyRecommendation {
  return {
    readiness,
    primaryAction: {
      title: 'Recovery Breathing',
      subtitle: 'Your body needs rest today — let\'s restore with guided breathing',
      route: '/(tabs)/mind-body/breathing',
      icon: 'moon',
      priority: 'high',
    },
    nutritionOverride: {
      focus: 'recovery',
      adjustedCaloriePct: 0.95, // Slight deficit reduction — prioritize recovery nutrients
      extraPromptInstructions: RECOVERY_NUTRITION_PROMPT,
    },
    breathingSession: {
      id: 'recovery_breathing_auto',
      title: '5-Min Recovery Breathing',
      description: 'Slow diaphragmatic breathing to activate parasympathetic recovery',
      category: 'meditation',
      duration: 5,
      intensity: 'gentle',
      thumbnailUrl: '',
      videoUrl: null,
      isBreathing: true,
      tags: ['recovery', 'hrv', 'parasympathetic'],
      createdAt: new Date().toISOString(),
    },
    genieContext: buildGenieRecoveryContext(readiness),
  };
}

function buildBalancedRoute(readiness: ReadinessScore): DailyRecommendation {
  return {
    readiness,
    primaryAction: {
      title: 'Gentle Yoga Flow',
      subtitle: 'Balanced state — moderate movement will keep you on track',
      route: '/(tabs)/mind-body?tab=yoga',
      icon: 'meditation',
      priority: 'medium',
    },
    nutritionOverride: {
      focus: 'maintenance',
      adjustedCaloriePct: 1.0,
      extraPromptInstructions: MAINTENANCE_NUTRITION_PROMPT,
    },
    breathingSession: null,
    genieContext: buildGenieBalancedContext(readiness),
  };
}

function buildPerformanceRoute(readiness: ReadinessScore): DailyRecommendation {
  return {
    readiness,
    primaryAction: {
      title: 'Form Check Challenge',
      subtitle: 'You\'re fully recovered — push yourself today!',
      route: '/(tabs)/form-check',
      icon: 'dumbbell',
      priority: 'high',
    },
    nutritionOverride: {
      focus: 'performance',
      adjustedCaloriePct: 1.05, // Slight surplus for performance
      extraPromptInstructions: PERFORMANCE_NUTRITION_PROMPT,
    },
    breathingSession: null,
    genieContext: buildGeniePerformanceContext(readiness),
  };
}

// ----- Nutrition Override Prompts -----

const RECOVERY_NUTRITION_PROMPT = `
TODAY'S CONTEXT: The user has LOW readiness (stressed/under-recovered).
NUTRITION PRIORITY: Cellular recovery and anti-inflammatory support.

FOCUS ON:
- Anti-inflammatory foods: fatty fish (salmon, sardines), leafy greens, berries, turmeric
- Magnesium-rich foods: dark leafy greens, pumpkin seeds, avocado, dark chocolate (85%+)
- Tryptophan sources for sleep: turkey, eggs, cottage cheese, bananas, oats
- Antioxidant-dense foods: blueberries, sweet potatoes, spinach, bell peppers
- Hydration support: water-rich foods (cucumber, watermelon, citrus)
- Gentle on digestion: well-cooked grains, soups, stews

AVOID TODAY:
- High-caffeine preparations
- Very spicy foods (cortisol spike)
- Excessively large portions (digestive stress)
- High-glycemic simple sugars

Calorie target: slight reduction (~5% below normal) to reduce digestive load.
Protein: maintain normal levels for tissue repair.
`.trim();

const MAINTENANCE_NUTRITION_PROMPT = `
TODAY'S CONTEXT: The user has BALANCED readiness (moderate recovery).
NUTRITION PRIORITY: Sustained energy and balanced macronutrients.

Standard whole-food plan with emphasis on:
- Balanced macro ratios
- Complex carbohydrates for sustained energy
- Moderate protein for maintenance
- Healthy fats from whole sources
`.trim();

const PERFORMANCE_NUTRITION_PROMPT = `
TODAY'S CONTEXT: The user has HIGH readiness (fully recovered).
NUTRITION PRIORITY: Performance fuel and muscle support.

FOCUS ON:
- Higher protein allocation for training adaptation
- Complex carbs for glycogen replenishment (sweet potatoes, quinoa, oats)
- Pre/post workout timing optimization
- Slight caloric surplus (~5% above maintenance) for performance
- Creatine-rich foods: red meat, fish
- Nitrate-rich foods for blood flow: beets, arugula, spinach
`.trim();

// ----- Genie Context Injection -----

function buildGenieRecoveryContext(readiness: ReadinessScore): string {
  return `READINESS CONTEXT: User's readiness score is ${readiness.overall}/100 (STRESSED).
HRV is below baseline. Body is under-recovered.
TONE: Be gentle, supportive, and recovery-focused.
DO NOT suggest intense workouts today.
SUGGEST: Guided breathing, gentle walks, sleep optimization, anti-inflammatory meals.
If user insists on working out, suggest very light mobility work only.`;
}

function buildGenieBalancedContext(readiness: ReadinessScore): string {
  return `READINESS CONTEXT: User's readiness score is ${readiness.overall}/100 (BALANCED).
Body is in a moderate recovery state.
TONE: Encouraging but measured.
SUGGEST: Moderate activity like yoga or a light form-check session. Standard nutrition.`;
}

function buildGeniePerformanceContext(readiness: ReadinessScore): string {
  return `READINESS CONTEXT: User's readiness score is ${readiness.overall}/100 (RECOVERED).
Body is fully recovered and ready for intensity.
TONE: Energizing, motivating, push-oriented.
SUGGEST: Full form-check sessions, progressive overload, performance nutrition.`;
}
