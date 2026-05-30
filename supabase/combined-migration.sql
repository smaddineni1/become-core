-- Become Platform — Initial Database Schema
-- Migration: 00001_initial_schema
-- Date: 2026-05-29
-- Description: Creates all core tables, RLS policies, indexes, and enables pgvector

-- Enable pgvector extension for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- USER PROFILES
-- =============================================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  fitness_goal TEXT NOT NULL DEFAULT 'improve_mobility'
    CHECK (fitness_goal IN ('lose_fat','build_muscle','improve_mobility','reduce_stress')),
  activity_level TEXT NOT NULL DEFAULT 'moderately_active'
    CHECK (activity_level IN ('sedentary','lightly_active','moderately_active','very_active')),
  dietary_preferences JSONB NOT NULL DEFAULT '[]',
  onboarding_completed_at TIMESTAMPTZ,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
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
-- =============================================================================
-- WORKOUT SESSIONS (Form Check)
-- =============================================================================
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  exercise TEXT NOT NULL
    CHECK (exercise IN ('air_squat','push_up','sit_up','kettlebell_swing')),
  total_reps INTEGER NOT NULL DEFAULT 0,
  average_score NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (average_score >= 0 AND average_score <= 100),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  cues_detected JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_started_at ON public.workout_sessions(user_id, started_at DESC);

-- RLS
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON public.workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================================
-- REP SCORES
-- =============================================================================
CREATE TABLE public.rep_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  rep_number INTEGER NOT NULL,
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  joint_angles JSONB NOT NULL,
  cues JSONB NOT NULL DEFAULT '[]',
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rep_scores_session_id ON public.rep_scores(session_id);

-- RLS (inherits access through session ownership)
ALTER TABLE public.rep_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rep scores"
  ON public.rep_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = rep_scores.session_id AND ws.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own rep scores"
  ON public.rep_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions ws
      WHERE ws.id = rep_scores.session_id AND ws.user_id = auth.uid()
    )
  );
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
-- =============================================================================
-- NUTRITION PLANS
-- =============================================================================
CREATE TABLE public.nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  meals JSONB NOT NULL,
  total_calories INTEGER NOT NULL CHECK (total_calories > 0),
  total_protein_g NUMERIC(5,1),
  total_carbs_g NUMERIC(5,1),
  total_fat_g NUMERIC(5,1),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  regeneration_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, plan_date)
);

CREATE INDEX idx_nutrition_plans_user_date ON public.nutrition_plans(user_id, plan_date DESC);

-- RLS
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own nutrition plans"
  ON public.nutrition_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition plans"
  ON public.nutrition_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition plans"
  ON public.nutrition_plans FOR UPDATE
  USING (auth.uid() = user_id);
-- =============================================================================
-- GENIE CONVERSATIONS & MESSAGES
-- =============================================================================
CREATE TABLE public.genie_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_genie_conversations_user_id ON public.genie_conversations(user_id);

CREATE TABLE public.genie_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.genie_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  action_buttons JSONB NOT NULL DEFAULT '[]',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_genie_messages_conversation ON public.genie_messages(conversation_id, created_at);

-- HNSW index for fast vector similarity search (RAG)
CREATE INDEX idx_genie_messages_embedding ON public.genie_messages
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- RLS
ALTER TABLE public.genie_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations"
  ON public.genie_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.genie_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.genie_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own messages"
  ON public.genie_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.genie_conversations gc
      WHERE gc.id = genie_messages.conversation_id AND gc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON public.genie_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.genie_conversations gc
      WHERE gc.id = genie_messages.conversation_id AND gc.user_id = auth.uid()
    )
  );
-- =============================================================================
-- USER PROFILES — RLS Policies
-- (Separated to allow running after the main table creation)
-- =============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- TRIGGER: auto-update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TRIGGER: auto-create user_profile on auth.users insert
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
-- =============================================================================
-- MINDFULNESS SESSIONS (Yoga & Meditation content)
-- =============================================================================
CREATE TABLE public.mindfulness_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('yoga', 'meditation')),
  duration INTEGER NOT NULL CHECK (duration IN (5, 10, 20)),
  intensity TEXT NOT NULL CHECK (intensity IN ('gentle', 'moderate', 'energizing')),
  thumbnail_url TEXT,
  video_url TEXT,
  is_breathing BOOLEAN NOT NULL DEFAULT false,
  tags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS needed — these are public content rows readable by all authenticated users
ALTER TABLE public.mindfulness_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sessions"
  ON public.mindfulness_sessions FOR SELECT
  USING (auth.role() = 'authenticated');
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
