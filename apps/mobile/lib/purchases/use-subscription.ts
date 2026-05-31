/**
 * useSubscription Hook
 *
 * Central hook for subscription state management.
 * Reads entitlements from RevenueCat and syncs with Supabase profile.
 */

import { useCallback, useEffect, useState } from 'react';
import type { SubscriptionInfo } from '../../src/packages/shared';
import { PREMIUM_GATES, FREE_TIER_LIMITS } from '../../src/packages/shared';
import { supabase } from '../supabase';

export interface UseSubscriptionReturn {
  subscription: SubscriptionInfo;
  isLoading: boolean;
  isPremium: boolean;
  isTrialing: boolean;
  canAccessFeature: (feature: keyof typeof PREMIUM_GATES) => boolean;
  getRemainingUsage: (feature: 'genieMessages' | 'nutritionRegenerations' | 'formCheckSessions') => number;
  purchasePremium: () => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
  refreshStatus: () => Promise<void>;
}

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'free',
  status: 'expired',
  trialEndsAt: null,
  currentPeriodEndsAt: null,
  cancelledAt: null,
};

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyUsage, setDailyUsage] = useState<Record<string, number>>({});

  const isPremium = subscription.tier === 'premium';
  const isTrialing = subscription.status === 'trial';

  useEffect(() => { refreshStatus(); }, []);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profile) {
          setSubscription({
            tier: profile.subscription_tier as 'free' | 'premium',
            status: profile.subscription_tier === 'premium' ? 'active' : 'expired',
            trialEndsAt: null,
            currentPeriodEndsAt: null,
            cancelledAt: null,
          });
        }
      }
      await loadDailyUsage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDailyUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    const { count: genieCount } = await supabase
      .from('genie_messages')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', `${today}T00:00:00`);

    const { count: formCheckCount } = await supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('started_at', `${today}T00:00:00`);

    setDailyUsage({
      genieMessages: genieCount ?? 0,
      formCheckSessions: formCheckCount ?? 0,
      nutritionRegenerations: 0,
    });
  };

  const canAccessFeature = useCallback(
    (feature: keyof typeof PREMIUM_GATES): boolean => {
      if (isPremium) return true;
      switch (feature) {
        case 'formCheck':
          return (dailyUsage['formCheckSessions'] ?? 0) < FREE_TIER_LIMITS.formCheckSessionsPerDay;
        case 'genieUnlimited':
          return (dailyUsage['genieMessages'] ?? 0) < FREE_TIER_LIMITS.genieMessagesPerDay;
        case 'nutritionRegenerate':
          return (dailyUsage['nutritionRegenerations'] ?? 0) < FREE_TIER_LIMITS.nutritionRegenerationsPerDay;
        case 'nutritionPlan':
          return true;
        case 'hrvIntegration':
        case 'breathingLibraryFull':
          return false;
        default:
          return false;
      }
    },
    [isPremium, dailyUsage],
  );

  const getRemainingUsage = useCallback(
    (feature: 'genieMessages' | 'nutritionRegenerations' | 'formCheckSessions'): number => {
      if (isPremium) return Infinity;
      switch (feature) {
        case 'genieMessages':
          return Math.max(0, FREE_TIER_LIMITS.genieMessagesPerDay - (dailyUsage['genieMessages'] ?? 0));
        case 'formCheckSessions':
          return Math.max(0, FREE_TIER_LIMITS.formCheckSessionsPerDay - (dailyUsage['formCheckSessions'] ?? 0));
        case 'nutritionRegenerations':
          return Math.max(0, FREE_TIER_LIMITS.nutritionRegenerationsPerDay - (dailyUsage['nutritionRegenerations'] ?? 0));
        default:
          return 0;
      }
    },
    [isPremium, dailyUsage],
  );

  const purchasePremium = useCallback(async () => {
    try {
      // Production: Purchases.purchasePackage(offerings.current.monthly)
      return { success: false, error: 'Purchase flow not available in development' };
    } catch (error: any) {
      return { success: false, error: error.message ?? 'Purchase failed' };
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      // Production: Purchases.restorePurchases()
      return { success: false, error: 'Restore not available in development' };
    } catch (error: any) {
      return { success: false, error: error.message ?? 'Restore failed' };
    }
  }, []);

  return {
    subscription, isLoading, isPremium, isTrialing,
    canAccessFeature, getRemainingUsage,
    purchasePremium, restorePurchases, refreshStatus,
  };
}
