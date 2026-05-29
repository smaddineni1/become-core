/**
 * Subscription & Payment types
 */
export type SubscriptionStatus =
  | 'active'
  | 'trial'
  | 'expired'
  | 'cancelled'
  | 'grace_period';

export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
  cancelledAt: string | null;
}

/**
 * Single "All-Access Premium" tier
 * $14.99–$19.99/month with 7-day free trial
 * US-only for Day 1 launch
 */
export const SUBSCRIPTION_CONFIG = {
  productId: 'become_premium_monthly',
  name: 'All-Access Premium',
  trialDays: 7,
  priceRange: { min: 14.99, max: 19.99, currency: 'USD' },
  launchRegions: ['US'],
  features: [
    'Unlimited AI Form Check sessions',
    'Daily personalized meal plans',
    'Full Genie AI coach access',
    'HRV-based session recommendations',
    'Priority guided breathing library',
    'All future premium content',
  ],
} as const;
