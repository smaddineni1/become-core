import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

/**
 * Onboarding Completion Celebration Screen
 *
 * Displays a congratulatory message with animated confetti-style elements,
 * a summary of what was set up, and a CTA to enter the main app.
 */

const CONFETTI_EMOJIS = ['🎉', '✨', '🌟', '💫', '🎊', '⭐', '🔥', '💪'];

interface ConfettiPiece {
  id: number;
  emoji: string;
  left: number;
  top: number;
  opacity: number;
}

export default function OnboardingComplete() {
  const { quizData } = useLocalSearchParams<{ quizData?: string }>();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Generate confetti pieces
    const pieces: ConfettiPiece[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length]!,
      left: Math.random() * 100,
      top: Math.random() * 60 + 5,
      opacity: Math.random() * 0.6 + 0.4,
    }));
    setConfetti(pieces);

    // Stagger content appearance
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterApp = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View className="flex-1 bg-slate-950">
      {/* Confetti Layer */}
      <View className="absolute inset-0 overflow-hidden">
        {confetti.map((piece) => (
          <Text
            key={piece.id}
            className="absolute text-2xl"
            style={{
              left: `${piece.left}%`,
              top: `${piece.top}%`,
              opacity: piece.opacity,
            }}
          >
            {piece.emoji}
          </Text>
        ))}
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Badge */}
        <View className="w-28 h-28 rounded-full bg-emerald-600/20 border-2 border-emerald-400 items-center justify-center mb-8">
          <Text className="text-5xl">🎉</Text>
        </View>

        <Text className="text-3xl font-bold text-white text-center">
          You're all set!
        </Text>
        <Text className="text-slate-400 mt-3 text-center text-base leading-6 max-w-xs">
          Your personalized wellness journey starts now. Everything is configured just for you.
        </Text>

        {/* Setup Summary */}
        {showContent && (
          <View className="mt-10 w-full gap-3">
            <SummaryItem
              emoji="🧬"
              title="Digital Twin Created"
              desc="243 body measurements mapped"
            />
            <SummaryItem
              emoji="🎯"
              title="Goals Configured"
              desc="Workouts, nutrition & mindfulness personalized"
            />
            <SummaryItem
              emoji="🧞"
              title="Genie Activated"
              desc="Your AI coach is ready to help anytime"
            />
            <SummaryItem
              emoji="🥗"
              title="Nutrition Engine Ready"
              desc="Whole-food meal plans tailored to your body"
            />
          </View>
        )}
      </View>

      {/* CTA */}
      <View className="px-6 pb-10">
        <Pressable
          className="bg-indigo-600 rounded-xl py-4 active:bg-indigo-700"
          onPress={handleEnterApp}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Enter Become
          </Text>
        </Pressable>
        <Text className="text-slate-500 text-xs text-center mt-3">
          You can update your profile and retake the scan anytime from Settings
        </Text>
      </View>
    </View>
  );
}

function SummaryItem({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <View className="flex-row items-center gap-4 bg-slate-900/80 rounded-xl p-4 border border-slate-800">
      <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
        <Text className="text-lg">{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold">{title}</Text>
        <Text className="text-slate-400 text-sm">{desc}</Text>
      </View>
      <Text className="text-emerald-400 font-bold">✓</Text>
    </View>
  );
}
