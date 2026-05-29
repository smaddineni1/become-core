import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

/**
 * Digital Twin Scan Screen
 *
 * 60-second immersive animated biometric scan simulation.
 * Shows a progress ring, cycling measurement labels, and pulsing body silhouette.
 * The actual computation is instant (SimulationScanProvider) — the timer is UX theater.
 */

const SCAN_DURATION_MS = 60_000;
const TICK_INTERVAL_MS = 50;

const MEASUREMENT_LABELS = [
  'Chest circumference',
  'Waist circumference',
  'Hip circumference',
  'Shoulder width',
  'Arm length (left)',
  'Arm length (right)',
  'Thigh circumference',
  'Calf circumference',
  'Neck circumference',
  'Torso length',
  'Inseam length',
  'Bicep circumference',
  'Forearm circumference',
  'Wrist circumference',
  'Body fat estimation',
  'Lean mass calculation',
  'BMI computation',
  'Skeletal muscle mass',
  'Basal metabolic rate',
  'Ankle circumference',
  'Knee circumference',
  'Hand length',
  'Foot length',
  'Arm span',
  'Sitting height',
  'Hip width',
  'Chest depth',
  'Abdominal depth',
  'Skin fold analysis',
  'Segment proportions',
];

type ScanPhase = 'ready' | 'scanning' | 'complete';

export default function DigitalTwinScan() {
  const { quizData } = useLocalSearchParams<{ quizData?: string }>();
  const [phase, setPhase] = useState<ScanPhase>('ready');
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState(MEASUREMENT_LABELS[0]!);
  const [measurementsFound, setMeasurementsFound] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const labelRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (labelRef.current) clearInterval(labelRef.current);
    };
  }, []);

  const startScan = () => {
    setPhase('scanning');
    startTimeRef.current = Date.now();

    // Progress tick
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(1, elapsed / SCAN_DURATION_MS);
      setProgress(pct);
      setMeasurementsFound(Math.floor(pct * 243));

      if (pct >= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (labelRef.current) clearInterval(labelRef.current);
        setPhase('complete');
      }
    }, TICK_INTERVAL_MS);

    // Cycling measurement labels
    let labelIndex = 0;
    labelRef.current = setInterval(() => {
      labelIndex = (labelIndex + 1) % MEASUREMENT_LABELS.length;
      setCurrentLabel(MEASUREMENT_LABELS[labelIndex]!);
    }, 1800);
  };

  const handleComplete = () => {
    router.push({
      pathname: '/(onboarding)/complete',
      params: { quizData: quizData ?? '{}' },
    });
  };

  // Ring dimensions
  const ringSize = 240;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View className="flex-1 bg-slate-950 items-center justify-center px-6">
      {/* Phase: Ready */}
      {phase === 'ready' && (
        <View className="items-center">
          {/* Body Silhouette Placeholder */}
          <View className="w-60 h-60 items-center justify-center">
            <View className="w-48 h-48 rounded-full border-2 border-indigo-600/40 items-center justify-center">
              <Text className="text-7xl">🧬</Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-bold mt-8 text-center">
            Digital Twin Body Scan
          </Text>
          <Text className="text-slate-400 mt-3 text-center text-base leading-6 max-w-xs">
            We'll create your personalized biometric profile by analyzing 240+ body measurements.
          </Text>

          {/* Privacy Notice */}
          <View className="mt-6 bg-slate-900/80 rounded-xl p-4 border border-slate-800 w-full">
            <Text className="text-slate-300 text-sm font-medium mb-1">
              Privacy First
            </Text>
            <Text className="text-slate-400 text-xs leading-5">
              Your biometric data is encrypted end-to-end and stored securely.
              Only you can access your measurements. We never share or sell your body data.
            </Text>
          </View>

          <Pressable
            className="bg-indigo-600 rounded-xl py-4 mt-8 w-full active:bg-indigo-700"
            onPress={startScan}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Begin Scan
            </Text>
          </Pressable>

          <Text className="text-slate-500 text-xs mt-3 text-center">
            This will take approximately 60 seconds
          </Text>
        </View>
      )}

      {/* Phase: Scanning */}
      {phase === 'scanning' && (
        <View className="items-center">
          {/* Progress Ring */}
          <View style={{ width: ringSize, height: ringSize }} className="items-center justify-center">
            <View className="absolute">
              <ProgressRingSVG
                size={ringSize}
                strokeWidth={strokeWidth}
                progress={progress}
              />
            </View>
            {/* Center Content */}
            <View className="items-center">
              <Text className="text-5xl font-bold text-white">
                {Math.round(progress * 100)}%
              </Text>
              <Text className="text-indigo-400 text-sm font-medium mt-1">
                {measurementsFound} found
              </Text>
            </View>
          </View>

          {/* Scanning Status */}
          <View className="mt-10 items-center">
            <Text className="text-white text-xl font-semibold">
              Scanning...
            </Text>
            <View className="mt-4 h-12 items-center justify-center">
              <Text className="text-indigo-300 text-base font-medium text-center">
                {currentLabel}
              </Text>
            </View>
          </View>

          {/* Pulsing Dots Animation Indicator */}
          <View className="flex-row gap-2 mt-8">
            <PulsingDot delay={0} />
            <PulsingDot delay={200} />
            <PulsingDot delay={400} />
          </View>

          <Text className="text-slate-500 text-xs mt-8 text-center">
            Hold still — analyzing your biometric profile
          </Text>
        </View>
      )}

      {/* Phase: Complete */}
      {phase === 'complete' && (
        <View className="items-center">
          <View className="w-32 h-32 rounded-full bg-emerald-600/20 border-2 border-emerald-500 items-center justify-center">
            <Text className="text-5xl">✓</Text>
          </View>

          <Text className="text-white text-2xl font-bold mt-8 text-center">
            Scan Complete!
          </Text>
          <Text className="text-slate-400 mt-3 text-center text-base leading-6 max-w-xs">
            We've mapped {measurementsFound} body measurements into your Digital Twin profile.
          </Text>

          {/* Summary Stats */}
          <View className="flex-row gap-4 mt-8">
            <StatCard label="Measurements" value="243" />
            <StatCard label="Confidence" value="85%" />
            <StatCard label="Provider" value="Sim" />
          </View>

          <Pressable
            className="bg-indigo-600 rounded-xl py-4 mt-10 w-full active:bg-indigo-700"
            onPress={handleComplete}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Continue
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// Sub-Components
// =============================================================================

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-slate-900 rounded-xl p-4 border border-slate-800 items-center min-w-[90px]">
      <Text className="text-white text-lg font-bold">{value}</Text>
      <Text className="text-slate-400 text-xs mt-0.5">{label}</Text>
    </View>
  );
}

function PulsingDot({ delay }: { delay: number }) {
  const [opacity, setOpacity] = useState(0.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prev) => (prev === 0.3 ? 1 : 0.3));
    }, 600);

    const timeout = setTimeout(() => {
      // Phase offset
    }, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [delay]);

  return (
    <View
      className="w-2.5 h-2.5 rounded-full bg-indigo-500"
      style={{ opacity }}
    />
  );
}

/**
 * Progress Ring — pure View-based implementation
 * (No SVG dependency needed — uses absolute positioned arcs)
 */
function ProgressRingSVG({
  size,
  strokeWidth,
  progress,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
}) {
  // Visual ring using nested views with border tricks
  const innerSize = size - strokeWidth * 2;

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      {/* Background ring */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#1E293B',
          position: 'absolute',
        }}
      />
      {/* Progress ring (approximated with border + rotation) */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: '#6366F1',
          borderRightColor: progress > 0.25 ? '#6366F1' : 'transparent',
          borderBottomColor: progress > 0.5 ? '#6366F1' : 'transparent',
          borderLeftColor: progress > 0.75 ? '#6366F1' : 'transparent',
          position: 'absolute',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      {/* Glow effect at high progress */}
      {progress > 0.8 && (
        <View
          style={{
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderWidth: 1,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            position: 'absolute',
          }}
        />
      )}
    </View>
  );
}
