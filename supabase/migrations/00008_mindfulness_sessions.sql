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
