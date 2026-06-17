-- ============================================
-- Gacha System: Daily Spins & Skills
-- ============================================

-- Daily spins tracking table
CREATE TABLE IF NOT EXISTS public.daily_spins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  spins_used INTEGER NOT NULL DEFAULT 0,
  points_spent INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, spin_date)
);

-- User skills inventory
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  skill_id TEXT NOT NULL CHECK (skill_id IN ('var_shield', 'trend_insurance', 'local_visitor_bonus', 'double_impact', 'hurricane_eye')),
  status TEXT NOT NULL DEFAULT 'inventory' CHECK (status IN ('inventory', 'equipped', 'consumed')),
  match_id TEXT,
  skill_config JSONB DEFAULT '{}',
  acquired_at TIMESTAMPTZ DEFAULT now(),
  -- match_id required when equipped
  CHECK (status != 'equipped' OR match_id IS NOT NULL)
);

-- Only 1 equipped skill per match per user
CREATE UNIQUE INDEX one_equipped_skill_per_match ON public.user_skills (user_id, match_id) WHERE status = 'equipped';

-- Performance indexes
CREATE INDEX idx_user_skills_user_status ON public.user_skills (user_id, status);
CREATE INDEX idx_daily_spins_user_date ON public.daily_spins (user_id, spin_date);

-- Add skill_bonuses column to scores
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS skill_bonuses JSONB DEFAULT '{}';

-- ============================================
-- RLS Policies
-- ============================================

-- daily_spins: users can only manage their own spins
ALTER TABLE public.daily_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spins"
  ON public.daily_spins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spins"
  ON public.daily_spins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spins"
  ON public.daily_spins FOR UPDATE
  USING (auth.uid() = user_id);

-- user_skills: users can manage their own skills
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills"
  ON public.user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON public.user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON public.user_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory skills"
  ON public.user_skills FOR DELETE
  USING (auth.uid() = user_id AND status = 'inventory');

-- ============================================
-- RPC: execute_spin
-- Atomic spin with validation, point deduction, skill assignment
-- ============================================

CREATE OR REPLACE FUNCTION public.execute_spin()
RETURNS JSONB
AS $$
DECLARE
  v_user_id UUID;
  v_spins_used INTEGER;
  v_max_spins INTEGER := 3;
  v_cost INTEGER;
  v_total_points INTEGER;
  v_inventory_count INTEGER;
  v_rand DOUBLE PRECISION;
  v_cumulative DOUBLE PRECISION;
  v_won_skill_id TEXT;
  v_won_skill_name TEXT;
  v_won_skill_rarity TEXT;
  v_today DATE := CURRENT_DATE;
  v_spin_record_id UUID;
  v_new_spins_used INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, spins_used INTO v_spin_record_id, v_spins_used
  FROM public.daily_spins
  WHERE user_id = v_user_id AND spin_date = v_today;

  v_spins_used := COALESCE(v_spins_used, 0);

  IF v_spins_used >= v_max_spins THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Daily spin limit reached');
  END IF;

  SELECT count(*) INTO v_inventory_count
  FROM public.user_skills
  WHERE user_id = v_user_id AND status IN ('inventory', 'equipped');

  IF v_inventory_count >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Inventory full');
  END IF;

  v_new_spins_used := v_spins_used + 1;
  v_cost := CASE v_new_spins_used
    WHEN 1 THEN 0
    WHEN 2 THEN 3
    WHEN 3 THEN 6
  END;

  IF v_cost > 0 THEN
    SELECT total_points INTO v_total_points
    FROM public.scores
    WHERE user_id = v_user_id;

    IF v_total_points IS NULL OR v_total_points < v_cost THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error', 'Insufficient points',
        'points_needed', v_cost,
        'points_available', COALESCE(v_total_points, 0)
      );
    END IF;

    UPDATE public.scores
    SET total_points = total_points - v_cost, updated_at = now()
    WHERE user_id = v_user_id AND total_points >= v_cost;
  END IF;

  v_rand := random();
  v_cumulative := 0;

  v_cumulative := v_cumulative + 0.40;
  IF v_rand <= v_cumulative THEN
    v_won_skill_id := 'var_shield';
    v_won_skill_name := 'Escudo VAR';
    v_won_skill_rarity := 'common';
  ELSE
    v_cumulative := v_cumulative + 0.25;
    IF v_rand <= v_cumulative THEN
      v_won_skill_id := 'trend_insurance';
      v_won_skill_name := 'Pacto de Lima';
      v_won_skill_rarity := 'common';
    ELSE
      v_cumulative := v_cumulative + 0.20;
      IF v_rand <= v_cumulative THEN
        v_won_skill_id := 'local_visitor_bonus';
        v_won_skill_name := 'Francotirador';
        v_won_skill_rarity := 'rare';
      ELSE
        v_cumulative := v_cumulative + 0.10;
        IF v_rand <= v_cumulative THEN
          v_won_skill_id := 'double_impact';
          v_won_skill_name := 'Doblete';
          v_won_skill_rarity := 'epic';
        ELSE
          v_won_skill_id := 'hurricane_eye';
          v_won_skill_name := 'La mano de Dios';
          v_won_skill_rarity := 'legendary';
        END IF;
      END IF;
    END IF;
  END IF;

  INSERT INTO public.user_skills (user_id, skill_id, status, skill_config)
  VALUES (v_user_id, v_won_skill_id, 'inventory', '{}'::jsonb);

  IF v_spin_record_id IS NOT NULL THEN
    UPDATE public.daily_spins
    SET spins_used = v_new_spins_used, points_spent = points_spent + v_cost
    WHERE id = v_spin_record_id;
  ELSE
    INSERT INTO public.daily_spins (user_id, spin_date, spins_used, points_spent)
    VALUES (v_user_id, v_today, 1, v_cost);
  END IF;

  SELECT total_points INTO v_total_points
  FROM public.scores
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'skill_id', v_won_skill_id,
    'skill_name', v_won_skill_name,
    'rarity', v_won_skill_rarity,
    'spins_remaining', v_max_spins - v_new_spins_used,
    'cost', v_cost,
    'points_after', COALESCE(v_total_points, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: equip_skill
-- Equip a skill from inventory to a specific match
-- ============================================

CREATE OR REPLACE FUNCTION public.equip_skill(
  p_user_skill_id UUID,
  p_match_id TEXT,
  p_team_choice TEXT DEFAULT NULL
)
RETURNS JSONB
AS $$
DECLARE
  v_user_id UUID;
  v_skill_id TEXT;
  v_current_status TEXT;
  v_existing_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT skill_id, status INTO v_skill_id, v_current_status
  FROM public.user_skills
  WHERE id = p_user_skill_id AND user_id = v_user_id;

  IF v_skill_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Skill not found');
  END IF;

  IF v_current_status != 'inventory' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Skill is not in inventory');
  END IF;

  SELECT count(*) INTO v_existing_count
  FROM public.user_skills
  WHERE user_id = v_user_id AND match_id = p_match_id AND status = 'equipped';

  IF v_existing_count > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Already have a skill for this match');
  END IF;

  UPDATE public.user_skills
  SET status = 'equipped',
      match_id = p_match_id,
      skill_config = CASE
        WHEN p_team_choice IS NOT NULL THEN jsonb_build_object('team', p_team_choice)
        ELSE skill_config
      END
  WHERE id = p_user_skill_id AND user_id = v_user_id;

  RETURN jsonb_build_object('ok', true, 'skill_id', v_skill_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: unequip_skill
-- Return an equipped skill back to inventory
-- ============================================

CREATE OR REPLACE FUNCTION public.unequip_skill(p_user_skill_id UUID)
RETURNS JSONB
AS $$
DECLARE
  v_current_status TEXT;
  v_inventory_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT status INTO v_current_status
  FROM public.user_skills
  WHERE id = p_user_skill_id AND user_id = auth.uid();

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Skill not found');
  END IF;

  IF v_current_status != 'equipped' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Can only unequip equipped skills');
  END IF;

  SELECT count(*) INTO v_inventory_count
  FROM public.user_skills
  WHERE user_id = auth.uid() AND status = 'inventory';

  IF v_inventory_count >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Inventory full. Descarta una habilidad primero.');
  END IF;

  UPDATE public.user_skills
  SET status = 'inventory', match_id = NULL, skill_config = '{}'::jsonb
  WHERE id = p_user_skill_id AND user_id = auth.uid();

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;