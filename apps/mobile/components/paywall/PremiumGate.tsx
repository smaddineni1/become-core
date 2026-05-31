/**
 * PremiumGate — Wrapper component for premium-only features
 *
 * Wraps any screen/component that requires premium access.
 * Shows the PaywallScreen if the user doesn't have access.
 *
 * Usage:
 * ```tsx
 * <PremiumGate feature="formCheck">
 *   <FormCheckSession />
 * </PremiumGate>
 * ```
 */

import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { PREMIUM_GATES } from '@app/packages/shared';
import { useSubscription } from '../../lib/purchases/use-subscription';
import { PaywallScreen } from './PaywallScreen';

interface PremiumGateProps {
  feature: keyof typeof PREMIUM_GATES;
  children: ReactNode;
  fallbackMessage?: string;
}

export function PremiumGate({ feature, children, fallbackMessage }: PremiumGateProps) {
  const { canAccessFeature, isPremium, getRemainingUsage } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const hasAccess = canAccessFeature(feature);

  if (showPaywall) {
    return (
      <PaywallScreen
        feature={feature}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={() => setShowPaywall(false)}
      />
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show upgrade prompt
  return (
    <View className="flex-1 bg-slate-950 items-center justify-center px-6">
      <View className="items-center max-w-sm">
        <View className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 items-center justify-center mb-4">
          <Text className="text-2xl">🔒</Text>
        </View>

        <Text className="text-white text-xl font-bold text-center">
          Premium Feature
        </Text>
        <Text className="text-slate-400 text-center mt-2 text-base leading-6">
          {fallbackMessage ?? `You've reached your daily limit for this feature.`}
        </Text>

        {!isPremium && (
          <View className="mt-2 bg-slate-900 rounded-lg px-3 py-1.5 border border-slate-800">
            <Text className="text-slate-500 text-xs text-center">
              Free tier: {getRemainingUsage('formCheckSessions')} sessions remaining today
            </Text>
          </View>
        )}

        <Pressable
          className="bg-indigo-600 rounded-xl py-4 mt-6 w-full active:bg-indigo-700"
          onPress={() => setShowPaywall(true)}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Upgrade to Premium
          </Text>
        </Pressable>

        <Text className="text-indigo-400 text-xs text-center mt-3">
          7-day free trial · Cancel anytime
        </Text>
      </View>
    </View>
  );
}
