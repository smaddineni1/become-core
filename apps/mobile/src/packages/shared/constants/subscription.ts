/**
 * RevenueCat product identifiers and entitlement config
 */
export const REVENUECAT_CONFIG = {
  entitlementId: 'premium',
  offerings: {
    default: 'become_premium',
  },
  products: {
    monthly: {
      ios: 'become_premium_monthly',
      android: 'become_premium_monthly',
    },
  },
} as const;

/**
 * Feature gates — which features require premium
 */
export const PREMIUM_GATES = {
  formCheck: true,
  nutritionPlan: true,
  nutritionRegenerate: true, // Free users get 1/day, premium unlimited
  genieUnlimited: true,     // Free users get 5 messages/day
  hrvIntegration: true,
  breathingLibraryFull: true,
} as const;

export const FREE_TIER_LIMITS = {
  genieMessagesPerDay: 5,
  nutritionRegenerationsPerDay: 1,
  formCheckSessionsPerDay: 1,
} as const;
