/**
 * Premium Gate — Server-side subscription verification middleware
 *
 * Used by Edge Functions to verify the user has an active premium subscription
 * before executing expensive operations (Form Check, Genie unlimited, etc.)
 *
 * This is the server-side enforcement — the client hook is defense-in-depth.
 * Even if a client is tampered with, the server blocks non-premium access.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

export interface GateResult {
  allowed: boolean;
  userId: string | null;
  tier: 'free' | 'premium' | null;
  reason?: string;
}

/**
 * Verify the user has premium access.
 * Returns { allowed: true } if premium, or { allowed: false, reason } if not.
 *
 * @param authHeader - The Authorization header from the request
 * @param feature - The feature being gated (for usage tracking)
 */
export async function verifyPremiumAccess(
  authHeader: string | null,
  feature: string,
): Promise<GateResult> {
  if (!authHeader?.startsWith('Bearer ')) {
    return { allowed: false, userId: null, tier: null, reason: 'Unauthorized' };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );

  // Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { allowed: false, userId: null, tier: null, reason: 'Invalid token' };
  }

  // Check subscription tier
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { allowed: false, userId: user.id, tier: null, reason: 'Profile not found' };
  }

  const tier = profile.subscription_tier as 'free' | 'premium';

  if (tier === 'premium') {
    return { allowed: true, userId: user.id, tier };
  }

  // Free tier — check daily usage limits
  const usageAllowed = await checkFreeTierUsage(supabase, user.id, feature);

  if (usageAllowed) {
    return { allowed: true, userId: user.id, tier };
  }

  return {
    allowed: false,
    userId: user.id,
    tier,
    reason: `Daily ${feature} limit reached. Upgrade to Premium for unlimited access.`,
  };
}

/**
 * Check if a free-tier user is within their daily usage limits.
 */
async function checkFreeTierUsage(
  supabase: any,
  userId: string,
  feature: string,
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  switch (feature) {
    case 'form_check': {
      const { count } = await supabase
        .from('workout_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', `${today}T00:00:00`);
      return (count ?? 0) < 1; // Free: 1 session/day
    }

    case 'genie_message': {
      // Count user messages in genie_messages via conversations
      const { data: convos } = await supabase
        .from('genie_conversations')
        .select('id')
        .eq('user_id', userId);

      if (!convos || convos.length === 0) return true;

      const convoIds = convos.map((c: any) => c.id);
      const { count } = await supabase
        .from('genie_messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convoIds)
        .eq('role', 'user')
        .gte('created_at', `${today}T00:00:00`);
      return (count ?? 0) < 5; // Free: 5 messages/day
    }

    case 'nutrition_regenerate': {
      const { data: plan } = await supabase
        .from('nutrition_plans')
        .select('regeneration_count')
        .eq('user_id', userId)
        .eq('plan_date', today)
        .single();
      return !plan || plan.regeneration_count < 1; // Free: 1 regen/day
    }

    default:
      return false;
  }
}

/**
 * Helper: Return a 403 response with upgrade prompt
 */
export function premiumRequiredResponse(reason: string, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: 'premium_required',
      message: reason,
      upgrade_cta: {
        label: 'Upgrade to Premium',
        description: 'Unlock unlimited form check sessions, AI coaching, and meal plans.',
        trial_days: 7,
      },
    }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}
