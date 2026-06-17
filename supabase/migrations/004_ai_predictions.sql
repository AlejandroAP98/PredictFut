-- AI Predictions table: one random score per user per match
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  match_id TEXT NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Enable RLS
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI predictions
CREATE POLICY "Users can view own ai_predictions"
  ON public.ai_predictions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own AI predictions
CREATE POLICY "Users can insert own ai_predictions"
  ON public.ai_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own AI predictions (for regeneration)
CREATE POLICY "Users can update own ai_predictions"
  ON public.ai_predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own AI predictions (for cancellation)
CREATE POLICY "Users can delete own ai_predictions"
  ON public.ai_predictions FOR DELETE
  USING (auth.uid() = user_id);

-- Add ai_bonuses column to scores
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS ai_bonuses JSONB DEFAULT '{}';

-- Performance index
CREATE INDEX IF NOT EXISTS idx_ai_predictions_user ON public.ai_predictions (user_id);