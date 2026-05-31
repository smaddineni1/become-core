/**
 * Nutrition Screen — Daily whole-food meal plan display
 *
 * Shows today's AI-generated meal plan with:
 * - Daily macro summary (calories, protein, carbs, fat)
 * - Expandable meal cards (ingredients, macros, prep time, method)
 * - Generate / Regenerate button with tier gating
 */

import { View, Text, Pressable, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import type { NutritionPlan, Meal } from '@app/packages/shared';
import { generateMealPlan, getTodaysMealPlan } from '../../../lib/api/nutrition';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export default function NutritionScreen() {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Fetch existing plan on mount
  useEffect(() => {
    loadExistingPlan();
  }, []);

  const loadExistingPlan = async () => {
    const existing = await getTodaysMealPlan();
    if (existing) {
      setPlan(existing);
      setLoadState('success');
    }
  };

  const handleGenerate = useCallback(async (regenerate: boolean = false) => {
    setLoadState('loading');
    setError(null);

    const result = await generateMealPlan(regenerate);

    if (result.success && result.plan) {
      setPlan(result.plan);
      setLoadState('success');
    } else {
      setError(result.error ?? 'Failed to generate plan');
      setLoadState('error');
    }
  }, []);

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-6">
        <Text className="text-3xl font-bold text-white">Nutrition</Text>
        <Text className="text-slate-400 mt-2 text-base">
          Your personalized whole-food meal plan
        </Text>
      </View>

      {/* Daily Summary Card */}
      <View className="px-6 mb-6">
        <View className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-slate-400 text-sm">Today's Targets</Text>
              <Text className="text-2xl font-bold text-white mt-1">
                {plan ? `${plan.totalCalories} kcal` : '-- kcal'}
              </Text>
            </View>
            <Pressable
              className={`px-4 py-2 rounded-xl active:opacity-80 ${
                loadState === 'loading' ? 'bg-slate-700' : 'bg-indigo-600'
              }`}
              onPress={() => handleGenerate(!!plan)}
              disabled={loadState === 'loading'}
            >
              <Text className="text-white font-semibold">
                {loadState === 'loading'
                  ? 'Generating...'
                  : plan
                    ? 'Regenerate'
                    : 'Generate'}
              </Text>
            </Pressable>
          </View>

          {/* Macro Bars */}
          {plan && (
            <View className="flex-row justify-between mt-4">
              <MacroStat label="Protein" value={plan.totalProteinG} unit="g" color="#6366F1" />
              <MacroStat label="Carbs" value={plan.totalCarbsG} unit="g" color="#FBBF24" />
              <MacroStat label="Fat" value={plan.totalFatG} unit="g" color="#F87171" />
            </View>
          )}
        </View>
      </View>

      {/* Error State */}
      {error && (
        <View className="px-6 mb-4">
          <View className="bg-red-900/30 rounded-xl p-4 border border-red-800/30">
            <Text className="text-red-300 text-sm">{error}</Text>
          </View>
        </View>
      )}

      {/* Loading State */}
      {loadState === 'loading' && (
        <View className="px-6 items-center py-12">
          <Text className="text-3xl mb-4">🥗</Text>
          <Text className="text-white font-semibold text-lg">
            Crafting your meal plan...
          </Text>
          <Text className="text-slate-400 text-sm mt-2 text-center">
            Our AI chef is selecting whole-food ingredients{'\n'}tailored to your goals
          </Text>
        </View>
      )}

      {/* Meal Cards */}
      {plan && loadState === 'success' && (
        <View className="px-6 gap-4 pb-8">
          {plan.meals.map((meal, idx) => (
            <MealCard key={idx} meal={meal} />
          ))}
        </View>
      )}

      {/* Empty State */}
      {!plan && loadState !== 'loading' && (
        <View className="px-6 items-center py-12">
          <Text className="text-5xl mb-4">🥬</Text>
          <Text className="text-white font-semibold text-lg text-center">
            No meal plan yet
          </Text>
          <Text className="text-slate-400 text-sm mt-2 text-center max-w-[280px]">
            Tap "Generate" to create a personalized whole-food meal plan based on your body and goals
          </Text>
        </View>
      )}

      {/* Brand Notice */}
      <View className="px-6 pb-10">
        <View className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/20">
          <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Whole-Food Promise
          </Text>
          <Text className="text-slate-400 text-xs leading-4">
            Every meal uses only whole, minimally processed ingredients.
            No protein bars, powders, or packaged supplements — ever.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ----- Sub-Components -----

function MacroStat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View className="items-center">
      <Text className="text-lg font-bold" style={{ color }}>
        {Math.round(value)}{unit}
      </Text>
      <Text className="text-slate-500 text-xs">{label}</Text>
    </View>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const [expanded, setExpanded] = useState(false);
  const typeEmoji = getMealTypeEmoji(meal.type);

  return (
    <Pressable
      className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden active:bg-slate-800/50"
      onPress={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <View className="p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <Text className="text-xl">{typeEmoji}</Text>
            <View className="flex-1">
              <Text className="text-slate-500 text-xs uppercase tracking-wider">
                {meal.type}
              </Text>
              <Text className="text-white font-semibold text-base mt-0.5">
                {meal.name}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-indigo-400 font-bold">{meal.calories} cal</Text>
            <Text className="text-slate-500 text-xs">{meal.prepTimeMinutes} min</Text>
          </View>
        </View>

        {/* Quick Macros */}
        <View className="flex-row gap-4 mt-3">
          <Text className="text-slate-400 text-xs">
            P: {meal.proteinG}g
          </Text>
          <Text className="text-slate-400 text-xs">
            C: {meal.carbsG}g
          </Text>
          <Text className="text-slate-400 text-xs">
            F: {meal.fatG}g
          </Text>
        </View>
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View className="px-5 pb-5 border-t border-slate-800 pt-4">
          {/* Ingredients */}
          <Text className="text-slate-300 text-sm font-medium mb-2">Ingredients</Text>
          <View className="gap-1 mb-4">
            {meal.ingredients.map((ing, idx) => (
              <Text key={idx} className="text-slate-400 text-sm">
                • {ing.quantity}{ing.unit} {ing.name}
              </Text>
            ))}
          </View>

          {/* Method */}
          <Text className="text-slate-300 text-sm font-medium mb-2">Method</Text>
          <Text className="text-slate-400 text-sm leading-5">{meal.method}</Text>
        </View>
      )}
    </Pressable>
  );
}

function getMealTypeEmoji(type: string): string {
  switch (type) {
    case 'breakfast': return '🍳';
    case 'lunch': return '🥗';
    case 'dinner': return '🍲';
    case 'snack': return '🥜';
    default: return '🍽️';
  }
}
