/**
 * PaywallScreen — Premium upgrade prompt
 *
 * Shown when a free user attempts to access a premium feature
 * after exhausting their daily free-tier limits.
 *
 * Features:
 * - Premium feature list
 * - Price display ($14.99–$19.99/mo)
 * - 7-day free trial CTA
 * - Restore purchases link
 */

import { View, Text, Pressable, ScrollView } from 'react-native';
import { SUBSCRIPTION_CONFIG } from '../../src/packages/shared';
import { useSubscription } from '../../lib/purchases/use-subscription';

interface PaywallScreenProps {
  feature: string; // Which feature triggered the paywall
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export function PaywallScreen({ feature, onClose, onPurchaseSuccess }: PaywallScreenProps) {
  const { purchasePremium, restorePurchases } = useSubscription();

  const handlePurchase = async () => {
    const result = await purchasePremium();
    if (result.success) {
      onPurchaseSuccess?.();
    }
  };

  const handleRestore = async () => {
    const result = await restorePurchases();
    if (result.success) {
      onPurchaseSuccess?.();
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="px-6 pt-16 pb-8 items-center">
        {/* Premium Badge */}
        <View className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500 items-center justify-center mb-6">
          <Text className="text-4xl">👑</Text>
        </View>

        <Text className="text-3xl font-bold text-white text-center">
          Unlock All-Access
        </Text>
        <Text className="text-slate-400 mt-3 text-center text-base leading-6 max-w-xs">
          Get unlimited access to every feature in Become
        </Text>
      </View>

      {/* Feature List */}
      <View className="px-6 gap-3 mb-8">
        {SUBSCRIPTION_CONFIG.features.map((feature, idx) => (
          <View key={idx} className="flex-row items-center gap-3">
            <View className="w-6 h-6 rounded-full bg-indigo-600/30 items-center justify-center">
              <Text className="text-indigo-400 text-xs font-bold">✓</Text>
            </View>
            <Text className="text-white text-base flex-1">{feature}</Text>
          </View>
        ))}
      </View>

      {/* Pricing Card */}
      <View className="px-6 mb-6">
        <View className="bg-slate-900 rounded-2xl p-6 border border-indigo-500/30">
          <Text className="text-slate-400 text-sm text-center">
            {SUBSCRIPTION_CONFIG.name}
          </Text>
          <View className="flex-row items-baseline justify-center mt-2">
            <Text className="text-white text-4xl font-bold">
              ${SUBSCRIPTION_CONFIG.priceRange.min}
            </Text>
            <Text className="text-slate-400 text-base ml-1">/month</Text>
          </View>
          <Text className="text-indigo-400 text-sm text-center mt-2 font-medium">
            {SUBSCRIPTION_CONFIG.trialDays}-day free trial included
          </Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View className="px-6 gap-3 pb-10">
        <Pressable
          className="bg-indigo-600 rounded-xl py-4 active:bg-indigo-700"
          onPress={handlePurchase}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Start Free Trial
          </Text>
        </Pressable>

        <Pressable
          className="border border-slate-700 rounded-xl py-3 active:bg-slate-800"
          onPress={handleRestore}
        >
          <Text className="text-slate-400 text-center font-medium">
            Restore Purchases
          </Text>
        </Pressable>

        <Pressable className="py-2" onPress={onClose}>
          <Text className="text-slate-500 text-center text-sm">
            Maybe later
          </Text>
        </Pressable>

        <Text className="text-slate-600 text-xs text-center mt-2 leading-4">
          Cancel anytime. Subscription auto-renews monthly.
          {'\n'}Payment charged to your App Store / Play Store account.
        </Text>
      </View>
    </ScrollView>
  );
}
