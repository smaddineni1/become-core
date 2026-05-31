/**
 * RevenueCat SDK Configuration
 *
 * Initializes the Purchases SDK for cross-platform subscription management.
 * Handles both iOS (StoreKit) and Android (Google Play Billing).
 *
 * Environment:
 * - API keys loaded from Doppler via EXPO_PUBLIC_ vars
 * - US-only launch (single offering, single product)
 */

import { Platform } from 'react-native';
import { REVENUECAT_CONFIG } from '@app/packages/shared';

// RevenueCat API Keys — loaded from environment
const RC_IOS_API_KEY = process.env.EXPO_PUBLIC_RC_IOS_API_KEY ?? '';
const RC_ANDROID_API_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_API_KEY ?? '';

/**
 * Get the platform-appropriate RevenueCat API key
 */
export function getRevenueCatApiKey(): string {
  return Platform.OS === 'ios' ? RC_IOS_API_KEY : RC_ANDROID_API_KEY;
}

/**
 * Initialize RevenueCat SDK
 *
 * Call this ONCE at app startup (in _layout.tsx after auth).
 * Must be called after the user is authenticated so we can set the appUserID.
 */
export async function initializeRevenueCat(userId: string): Promise<void> {
  // In production with react-native-purchases installed:
  // Purchases.configure({
  //   apiKey: getRevenueCatApiKey(),
  //   appUserID: userId,
  // });
  console.warn('[RevenueCat] Initialized for user:', userId);
}

/**
 * RevenueCat product identifiers
 */
export const RC_PRODUCTS = {
  monthlyPremium: REVENUECAT_CONFIG.products.monthly,
  entitlementId: REVENUECAT_CONFIG.entitlementId,
  offeringId: REVENUECAT_CONFIG.offerings.default,
} as const;

/**
 * Webhook events we handle from RevenueCat → Supabase
 */
export const RC_WEBHOOK_EVENTS = [
  'INITIAL_PURCHASE',
  'RENEWAL',
  'CANCELLATION',
  'UNCANCELLATION',
  'BILLING_ISSUE',
  'SUBSCRIBER_ALIAS',
  'PRODUCT_CHANGE',
  'EXPIRATION',
  'TRANSFER',
] as const;

export type RCWebhookEvent = typeof RC_WEBHOOK_EVENTS[number];
