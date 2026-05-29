import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import type {
  FitnessGoal,
  ActivityLevel,
  DietaryPreference,
  OnboardingQuizInput,
} from '@become/shared';

type QuizStep = 1 | 2 | 3 | 4 | 5 | 6;

const TOTAL_STEPS = 6;

export default function OnboardingQuiz() {
  const [step, setStep] = useState<QuizStep>(1);
  const [answers, setAnswers] = useState<Partial<OnboardingQuizInput>>({
    dietaryPreferences: [],
  });

  const progress = step / TOTAL_STEPS;

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return !!answers.age && answers.age >= 13 && answers.age <= 120;
      case 2: return !!answers.sex;
      case 3: return !!answers.heightCm && !!answers.weightKg;
      case 4: return !!answers.fitnessGoal;
      case 5: return !!answers.activityLevel;
      case 6: return true; // dietary preferences are optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((step + 1) as QuizStep);
    } else {
      // Quiz complete — navigate to scan with answers
      router.push({
        pathname: '/(onboarding)/scan',
        params: { quizData: JSON.stringify(answers) },
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as QuizStep);
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Progress Bar */}
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={handleBack}>
            <Text className="text-indigo-400 font-medium text-base">
              {step === 1 ? 'Cancel' : '← Back'}
            </Text>
          </Pressable>
          <Text className="text-slate-400 text-sm">
            {step} of {TOTAL_STEPS}
          </Text>
        </View>
        <View className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-600 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      </View>

      {/* Step Content */}
      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <StepAge
            value={answers.age}
            onChange={(age) => setAnswers((a) => ({ ...a, age }))}
          />
        )}
        {step === 2 && (
          <StepSex
            value={answers.sex}
            onChange={(sex) => setAnswers((a) => ({ ...a, sex }))}
          />
        )}
        {step === 3 && (
          <StepBodyMetrics
            height={answers.heightCm}
            weight={answers.weightKg}
            onHeightChange={(heightCm) => setAnswers((a) => ({ ...a, heightCm }))}
            onWeightChange={(weightKg) => setAnswers((a) => ({ ...a, weightKg }))}
          />
        )}
        {step === 4 && (
          <StepFitnessGoal
            value={answers.fitnessGoal}
            onChange={(fitnessGoal) => setAnswers((a) => ({ ...a, fitnessGoal }))}
          />
        )}
        {step === 5 && (
          <StepActivityLevel
            value={answers.activityLevel}
            onChange={(activityLevel) => setAnswers((a) => ({ ...a, activityLevel }))}
          />
        )}
        {step === 6 && (
          <StepDietaryPreferences
            value={answers.dietaryPreferences ?? []}
            onChange={(dietaryPreferences) =>
              setAnswers((a) => ({ ...a, dietaryPreferences }))
            }
          />
        )}
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-10 pt-4">
        <Pressable
          className={`rounded-xl py-4 ${
            canAdvance() ? 'bg-indigo-600 active:bg-indigo-700' : 'bg-slate-800'
          }`}
          onPress={handleNext}
          disabled={!canAdvance()}
        >
          <Text
            className={`text-center font-semibold text-lg ${
              canAdvance() ? 'text-white' : 'text-slate-500'
            }`}
          >
            {step === TOTAL_STEPS ? 'Continue to Body Scan' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// =============================================================================
// STEP COMPONENTS
// =============================================================================

function StepAge({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="pt-8">
      <Text className="text-3xl font-bold text-white">How old are you?</Text>
      <Text className="text-slate-400 mt-2 text-base leading-6">
        This helps us personalize your caloric targets and exercise recommendations.
      </Text>
      <TextInput
        className="bg-slate-900 rounded-xl px-4 py-5 text-white text-2xl text-center border border-slate-800 mt-8"
        placeholder="Your age"
        placeholderTextColor="#64748B"
        value={value ? String(value) : ''}
        onChangeText={(t) => {
          const num = parseInt(t, 10);
          if (!isNaN(num)) onChange(num);
          else if (t === '') onChange(0);
        }}
        keyboardType="number-pad"
        maxLength={3}
      />
      <Text className="text-slate-500 text-xs text-center mt-3">
        You must be at least 13 years old to use Become
      </Text>
    </View>
  );
}

function StepSex({
  value,
  onChange,
}: {
  value?: 'male' | 'female' | 'other';
  onChange: (v: 'male' | 'female' | 'other') => void;
}) {
  const options: Array<{ id: 'male' | 'female' | 'other'; label: string; emoji: string }> = [
    { id: 'male', label: 'Male', emoji: '♂️' },
    { id: 'female', label: 'Female', emoji: '♀️' },
    { id: 'other', label: 'Prefer not to say', emoji: '⚧️' },
  ];

  return (
    <View className="pt-8">
      <Text className="text-3xl font-bold text-white">Biological sex</Text>
      <Text className="text-slate-400 mt-2 text-base leading-6">
        Used for accurate body composition and metabolic calculations.
      </Text>
      <View className="gap-3 mt-8">
        {options.map((opt) => (
          <Pressable
            key={opt.id}
            className={`rounded-xl p-5 border ${
              value === opt.id
                ? 'bg-indigo-600/20 border-indigo-500'
                : 'bg-slate-900 border-slate-800 active:bg-slate-800'
            }`}
            onPress={() => onChange(opt.id)}
          >
            <View className="flex-row items-center gap-4">
              <Text className="text-2xl">{opt.emoji}</Text>
              <Text className={`text-lg font-semibold ${
                value === opt.id ? 'text-indigo-300' : 'text-white'
              }`}>
                {opt.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StepBodyMetrics({
  height,
  weight,
  onHeightChange,
  onWeightChange,
}: {
  height?: number;
  weight?: number;
  onHeightChange: (v: number) => void;
  onWeightChange: (v: number) => void;
}) {
  return (
    <View className="pt-8">
      <Text className="text-3xl font-bold text-white">Your measurements</Text>
      <Text className="text-slate-400 mt-2 text-base leading-6">
        These seed your Digital Twin biometric profile.
      </Text>
      <View className="gap-4 mt-8">
        <View>
          <Text className="text-slate-300 font-medium mb-2">Height (cm)</Text>
          <TextInput
            className="bg-slate-900 rounded-xl px-4 py-4 text-white text-xl border border-slate-800"
            placeholder="e.g. 175"
            placeholderTextColor="#64748B"
            value={height ? String(height) : ''}
            onChangeText={(t) => {
              const num = parseFloat(t);
              if (!isNaN(num)) onHeightChange(num);
              else if (t === '') onHeightChange(0);
            }}
            keyboardType="decimal-pad"
          />
        </View>
        <View>
          <Text className="text-slate-300 font-medium mb-2">Weight (kg)</Text>
          <TextInput
            className="bg-slate-900 rounded-xl px-4 py-4 text-white text-xl border border-slate-800"
            placeholder="e.g. 72"
            placeholderTextColor="#64748B"
            value={weight ? String(weight) : ''}
            onChangeText={(t) => {
              const num = parseFloat(t);
              if (!isNaN(num)) onWeightChange(num);
              else if (t === '') onWeightChange(0);
            }}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    </View>
  );
}

function StepFitnessGoal({
  value,
  onChange,
}: {
  value?: FitnessGoal;
  onChange: (v: FitnessGoal) => void;
}) {
  const goals: Array<{ id: FitnessGoal; label: string; emoji: string; desc: string }> = [
    { id: 'lose_fat', label: 'Lose Fat', emoji: '🔥', desc: 'Reduce body fat while preserving muscle' },
    { id: 'build_muscle', label: 'Build Muscle', emoji: '💪', desc: 'Gain lean muscle mass and strength' },
    { id: 'improve_mobility', label: 'Improve Mobility', emoji: '🧘', desc: 'Better flexibility and movement quality' },
    { id: 'reduce_stress', label: 'Reduce Stress', emoji: '🧠', desc: 'Lower cortisol and improve mental clarity' },
  ];

  return (
    <View className="pt-8">
      <Text className="text-3xl font-bold text-white">Your primary goal</Text>
      <Text className="text-slate-400 mt-2 text-base leading-6">
        This shapes your meal plans, workouts, and Genie recommendations.
      </Text>
      <View className="gap-3 mt-8">
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            className={`rounded-xl p-5 border ${
              value === goal.id
                ? 'bg-indigo-600/20 border-indigo-500'
                : 'bg-slate-900 border-slate-800 active:bg-slate-800'
            }`}
            onPress={() => onChange(goal.id)}
          >
            <View className="flex-row items-center gap-4">
              <Text className="text-2xl">{goal.emoji}</Text>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${
                  value === goal.id ? 'text-indigo-300' : 'text-white'
                }`}>
                  {goal.label}
                </Text>
                <Text className="text-slate-400 text-sm mt-0.5">{goal.desc}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StepActivityLevel({
  value,
  onChange,
}: {
  value?: ActivityLevel;
  onChange: (v: ActivityLevel) => void;
}) {
  const levels: Array<{ id: ActivityLevel; label: string; desc: string }> = [
    { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise, desk job' },
    { id: 'lightly_active', label: 'Lightly Active', desc: '1-3 days/week of light exercise' },
    { id: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week of moderate exercise' },
    { id: 'very_active', label: 'Very Active', desc: '6-7 days/week of intense exercise' },
  ];

  return (
    <View className="pt-8">
      <Text className="text-3xl font-bold text-white">Activity level</Text>
      <Text className="text-slate-400 mt-2 text-base leading-6">
        How active are you in a typical week?
      </Text>
      <View className="gap-3 mt-8">
        {levels.map((level) => (
          <Pressable
            key={level.id}
            className={`rounded-xl p-5 border ${
              value === level.id
                ? 'bg-indigo-600/20 border-indigo-500'
                : 'bg-slate-900 border-slate-800 active:bg-slate-800'
            }`}
            onPress={() => onChange(level.id)}
          >
            <Text className={`text-lg font-semibold ${
              value === level.id ? 'text-indigo-300' : 'text-white'
            }`}>
              {level.label}
            </Text>
            <Text className="text-slate-400 text-sm mt-0.5">{level.desc}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StepDietaryPreferences({
  value,
  onChange,
}: {
  value: DietaryPreference[];
  onChange: (v: DietaryPreference[]) => void;
}) {
  const options: Array<{ id: DietaryPreference; label: string; emoji: string }> = [
    { id: 'none', label: 'No restrictions (omnivore)', emoji: '🥩' },
    { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
    { id: 'vegan', label: 'Vegan', emoji: '🌱' },
    { id: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
    { id: 'keto', label: 'Keto', emoji: '🥑' },
    { id: 'paleo', label: 'Paleo', emoji: '🦴' },
    { id: 'gluten_free', label: 'Gluten Free', emoji: '🌾' },
    { id: 'dairy_free', label: 'Dairy Free', emoji: '🥛' },
  ];

  const toggle = (id: DietaryPreference) => {
    if (id === 'none') {
      onChange(['none']);
      return;
    }
    const filtered = value.filter((v) => v !== 'none');
    if (filtered.includes(id)) {
      onChange(filtered.filter((v) => v !== id));
    } else {
      onChange([...filtered, id]);
    }
  };

  return (
    <View className="pt-8">
      <Text className="text-3xl font-bold text-white">Dietary preferences</Text>
      <Text className="text-slate-400 mt-2 text-base leading-6">
        Select all that apply. Your meal plans will respect these strictly.
      </Text>
      <View className="gap-3 mt-8">
        {options.map((opt) => {
          const selected = value.includes(opt.id);
          return (
            <Pressable
              key={opt.id}
              className={`rounded-xl p-4 border flex-row items-center gap-3 ${
                selected
                  ? 'bg-indigo-600/20 border-indigo-500'
                  : 'bg-slate-900 border-slate-800 active:bg-slate-800'
              }`}
              onPress={() => toggle(opt.id)}
            >
              <Text className="text-xl">{opt.emoji}</Text>
              <Text className={`text-base font-medium ${
                selected ? 'text-indigo-300' : 'text-white'
              }`}>
                {opt.label}
              </Text>
              {selected && (
                <Text className="ml-auto text-indigo-400 font-bold">✓</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
