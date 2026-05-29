-- =============================================================================
-- BIOMETRIC PROFILES (Digital Twin)
-- =============================================================================
CREATE TABLE public.user_biometric_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'simulation'
    CHECK (provider IN ('simulation', 'bodygram')),
  measurements JSONB NOT NULL,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.85
    CHECK (confidence >= 0 AND confidence <= 1),
  raw_provider_data JSONB,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, scanned_at)
);

CREATE INDEX idx_biometric_profiles_user_id ON public.user_biometric_profiles(user_id);

-- RLS
ALTER TABLE public.user_biometric_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own biometric profiles"
  ON public.user_biometric_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biometric profiles"
  ON public.user_biometric_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
