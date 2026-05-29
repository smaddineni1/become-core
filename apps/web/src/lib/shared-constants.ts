/**
 * Inlined shared constants for the web preview deployment.
 * These are duplicated from @become/shared to avoid workspace:* dependency
 * which breaks Vercel's npm install for standalone web deploys.
 *
 * In production (Turborepo build), we use the real @become/shared package.
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

export const FREE_TIER_LIMITS = {
  genieMessagesPerDay: 5,
  nutritionRegenerationsPerDay: 1,
  formCheckSessionsPerDay: 1,
} as const;
