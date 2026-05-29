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
