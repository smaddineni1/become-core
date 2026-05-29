-- =============================================================================
-- HRV READINGS
-- =============================================================================
CREATE TABLE public.hrv_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rmssd_ms NUMERIC(6,2) NOT NULL CHECK (rmssd_ms > 0),
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'healthkit', 'health_connect')),
  classification TEXT NOT NULL
    CHECK (classification IN ('recovery', 'balanced', 'stressed')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hrv_readings_user_id ON public.hrv_readings(user_id);
CREATE INDEX idx_hrv_readings_trend ON public.hrv_readings(user_id, recorded_at DESC);

-- RLS
ALTER TABLE public.hrv_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own HRV readings"
  ON public.hrv_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own HRV readings"
  ON public.hrv_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
