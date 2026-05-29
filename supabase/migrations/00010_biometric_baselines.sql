-- =============================================================================
-- BIOMETRIC BASELINES & READINESS SCORES
-- Tables for sleep, resting HR, rolling baselines, and daily readiness.
-- =============================================================================

-- Sleep Readings
CREATE TABLE public.sleep_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
  deep_sleep_minutes INTEGER,
  rem_sleep_minutes INTEGER,
  light_sleep_minutes INTEGER,
  awake_minutes INTEGER,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','healthkit','health_connect')),
  recorded_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, recorded_date)
);

CREATE INDEX idx_sleep_readings_user ON public.sleep_readings(user_id, recorded_date DESC);

-- Resting Heart Rate Readings
CREATE TABLE public.resting_hr_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  bpm INTEGER NOT NULL CHECK (bpm > 0 AND bpm < 250),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','healthkit','health_connect')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, recorded_at)
);

CREATE INDEX idx_resting_hr_user ON public.resting_hr_readings(user_id, recorded_at DESC);

-- Rolling Biometric Baselines (computed daily by cron)
CREATE TABLE public.biometric_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  hrv_baseline_ms NUMERIC(6,2) NOT NULL DEFAULT 0,
  resting_hr_baseline NUMERIC(5,1) NOT NULL DEFAULT 0,
  sleep_baseline_minutes NUMERIC(5,1) NOT NULL DEFAULT 0,
  window_days INTEGER NOT NULL DEFAULT 7,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Daily Readiness Scores
CREATE TABLE public.readiness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  hrv_factor INTEGER NOT NULL DEFAULT 50,
  resting_hr_factor INTEGER NOT NULL DEFAULT 50,
  sleep_factor INTEGER NOT NULL DEFAULT 50,
  classification TEXT NOT NULL CHECK (classification IN ('recovered','balanced','stressed')),
  recommendation_category TEXT NOT NULL CHECK (recommendation_category IN ('high_intensity','moderate_activity','recovery')),
  nutrition_focus TEXT NOT NULL CHECK (nutrition_focus IN ('performance','maintenance','recovery')),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, score_date)
);

CREATE INDEX idx_readiness_user_date ON public.readiness_scores(user_id, score_date DESC);

-- RLS
ALTER TABLE public.sleep_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resting_hr_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own sleep data" ON public.sleep_readings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own resting HR data" ON public.resting_hr_readings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own baselines" ON public.biometric_baselines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users own readiness scores" ON public.readiness_scores
  FOR SELECT USING (auth.uid() = user_id);
