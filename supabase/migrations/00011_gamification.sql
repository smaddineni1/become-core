-- GAMIFICATION: Activity Logging, Points, Streaks, Leaderboard

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('meal_logged','workout_completed','water_logged','breathing_completed','hrv_logged','streak_bonus')),
  description TEXT,
  points_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id, logged_at DESC);

CREATE TABLE public.user_points (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.daily_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  points_date DATE NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  activities_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, points_date)
);
CREATE INDEX idx_daily_points_date ON public.daily_points(points_date DESC, points_earned DESC);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own activity log" ON public.activity_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own points" ON public.user_points FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read daily points" ON public.daily_points FOR SELECT USING (true);
CREATE POLICY "Users write daily points" ON public.daily_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update daily points" ON public.daily_points FOR UPDATE USING (auth.uid() = user_id);
