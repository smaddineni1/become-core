-- =============================================================================
-- SUBSCRIPTION EVENTS (Audit trail for RevenueCat webhooks)
-- =============================================================================
-- Logs every RevenueCat webhook event for audit, debugging, and analytics.
-- Uses service role key (no RLS) — only written by the webhook Edge Function.

CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  product_id TEXT,
  expiration_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX idx_subscription_events_type ON public.subscription_events(event_type);
CREATE INDEX idx_subscription_events_created ON public.subscription_events(created_at DESC);

-- RLS: Only service role can write (webhook function).
-- Users can read their own events (for subscription history in profile).
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription events"
  ON public.subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated role —
-- only the service role key (used by webhook function) can write.
