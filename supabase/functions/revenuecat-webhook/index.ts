/**
 * Edge Function: revenuecat-webhook
 *
 * Receives secure webhooks from RevenueCat when subscription events occur.
 * Updates the user's subscription_tier in user_profiles accordingly.
 *
 * Security:
 * - Validates webhook signature using shared secret (RC_WEBHOOK_SECRET)
 * - Uses Supabase service role key (bypasses RLS) for admin updates
 * - Logs all events to subscription_events for audit trail
 *
 * Events handled:
 * - INITIAL_PURCHASE → tier = 'premium'
 * - RENEWAL → tier = 'premium'
 * - UNCANCELLATION → tier = 'premium'
 * - CANCELLATION → tier remains 'premium' until expiration
 * - EXPIRATION → tier = 'free'
 * - BILLING_ISSUE → tier = 'premium' (grace period)
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 1. Validate webhook authorization
    const authHeader = req.headers.get('Authorization');
    const expectedSecret = Deno.env.get('RC_WEBHOOK_SECRET');

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      console.error('[RC Webhook] Invalid authorization');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse webhook payload
    const payload = await req.json();
    const event = payload.event;

    if (!event) {
      return new Response(JSON.stringify({ error: 'No event in payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const eventType: string = event.type;
    const appUserId: string = event.app_user_id;
    const productId: string = event.product_id ?? '';
    const expirationAtMs: number | null = event.expiration_at_ms ?? null;
    const purchasedAtMs: number | null = event.purchased_at_ms ?? null;

    console.log(`[RC Webhook] Event: ${eventType} for user: ${appUserId}`);

    if (!appUserId) {
      return new Response(JSON.stringify({ error: 'Missing app_user_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Initialize Supabase with SERVICE ROLE key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 4. Log event to audit table
    await supabase.from('subscription_events').insert({
      user_id: appUserId,
      event_type: eventType,
      product_id: productId,
      expiration_at: expirationAtMs ? new Date(expirationAtMs).toISOString() : null,
      purchased_at: purchasedAtMs ? new Date(purchasedAtMs).toISOString() : null,
      raw_payload: payload,
    });

    // 5. Determine new subscription tier
    let newTier: 'free' | 'premium' = 'free';

    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
      case 'PRODUCT_CHANGE':
        newTier = 'premium';
        break;

      case 'CANCELLATION':
        // User cancelled but subscription remains active until period ends
        // Keep premium — EXPIRATION event will downgrade later
        newTier = 'premium';
        break;

      case 'BILLING_ISSUE':
        // Grace period — keep premium, RevenueCat will retry billing
        newTier = 'premium';
        break;

      case 'EXPIRATION':
        // Subscription has fully expired — downgrade to free
        newTier = 'free';
        break;

      case 'TRANSFER':
        // User transferred subscription — keep premium
        newTier = 'premium';
        break;

      default:
        console.log(`[RC Webhook] Unhandled event type: ${eventType}`);
        return new Response(JSON.stringify({ success: true, action: 'ignored' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // 6. Update user profile subscription tier
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appUserId);

    if (updateError) {
      console.error('[RC Webhook] Failed to update user:', updateError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to update subscription', details: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    console.log(`[RC Webhook] User ${appUserId} updated to tier: ${newTier}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId: appUserId,
        newTier,
        eventType,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[RC Webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
