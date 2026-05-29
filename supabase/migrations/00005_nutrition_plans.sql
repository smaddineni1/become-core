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
