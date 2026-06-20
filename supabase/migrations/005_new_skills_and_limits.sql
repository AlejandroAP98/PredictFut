-- Add new skills and update limits
-- Changes:
--   1. Add haramball and futbol_champagne to skill_id CHECK constraint
--   2. Update execute_spin: 5 max spins, 5 max inventory, new costs (0/2/4/6/8), new drop rates
--   3. Update unequip_skill: 5 max inventory

-- Step 1: Update skill_id CHECK constraint to include new skills
ALTER TABLE public.user_skills
  DROP CONSTRAINT user_skills_skill_id_check;

ALTER TABLE public.user_skills
  ADD CONSTRAINT user_skills_skill_id_check
  CHECK (skill_id IN ('var_shield', 'trend_insurance', 'local_visitor_bonus', 'haramball', 'futbol_champagne', 'double_impact', 'hurricane_eye'));

-- Step 2: Replace execute_spin with updated version
CREATE OR REPLACE FUNCTION public.execute_spin()
RETURNS JSONB
AS $$
DECLARE
  v_user_id UUID;
  v_spins_used INTEGER;
  v_max_spins INTEGER := 5;
  v_cost INTEGER;
  v_earned_points INTEGER;
  v_total_spent INTEGER;
  v_available_points INTEGER;
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

  IF v_inventory_count >= 5 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Inventory full');
  END IF;

  v_new_spins_used := v_spins_used + 1;
  v_cost := CASE v_new_spins_used
    WHEN 1 THEN 0
    WHEN 2 THEN 2
    WHEN 3 THEN 4
    WHEN 4 THEN 6
    WHEN 5 THEN 8
  END;

  IF v_cost > 0 THEN
    SELECT COALESCE(total_points, 0) INTO v_earned_points
    FROM public.scores
    WHERE user_id = v_user_id;

    SELECT COALESCE(SUM(points_spent), 0) INTO v_total_spent
    FROM public.daily_spins
    WHERE user_id = v_user_id;

    v_available_points := v_earned_points + v_total_spent;

    IF v_available_points < v_cost THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error', 'Insufficient points',
        'points_needed', v_cost,
        'points_available', v_available_points
      );
    END IF;

    UPDATE public.scores
    SET total_points = total_points - v_cost, updated_at = now()
    WHERE user_id = v_user_id;
  END IF;

  v_rand := random();
  v_cumulative := 0;

  v_cumulative := v_cumulative + 0.20;
  IF v_rand <= v_cumulative THEN
    v_won_skill_id := 'var_shield';
    v_won_skill_name := 'Escudo VAR';
    v_won_skill_rarity := 'common';
  ELSE
    v_cumulative := v_cumulative + 0.20;
    IF v_rand <= v_cumulative THEN
      v_won_skill_id := 'trend_insurance';
      v_won_skill_name := 'Pacto de Lima';
      v_won_skill_rarity := 'common';
    ELSE
      v_cumulative := v_cumulative + 0.15;
      IF v_rand <= v_cumulative THEN
        v_won_skill_id := 'local_visitor_bonus';
        v_won_skill_name := 'Francotirador';
        v_won_skill_rarity := 'rare';
      ELSE
        v_cumulative := v_cumulative + 0.15;
        IF v_rand <= v_cumulative THEN
          v_won_skill_id := 'haramball';
          v_won_skill_name := 'Haramball';
          v_won_skill_rarity := 'rare';
        ELSE
          v_cumulative := v_cumulative + 0.15;
          IF v_rand <= v_cumulative THEN
            v_won_skill_id := 'futbol_champagne';
            v_won_skill_name := 'Fútbol champagne';
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

  SELECT COALESCE(total_points, 0) INTO v_earned_points
  FROM public.scores
  WHERE user_id = v_user_id;

  SELECT COALESCE(SUM(points_spent), 0) INTO v_total_spent
  FROM public.daily_spins
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'skill_id', v_won_skill_id,
    'skill_name', v_won_skill_name,
    'rarity', v_won_skill_rarity,
    'spins_remaining', v_max_spins - v_new_spins_used,
    'cost', v_cost,
    'points_after', v_earned_points + v_total_spent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Update unequip_skill with 5 max inventory
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

  IF v_inventory_count >= 5 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Inventory full. Descarta una habilidad primero.');
  END IF;

  UPDATE public.user_skills
  SET status = 'inventory', match_id = NULL, skill_config = '{}'::jsonb
  WHERE id = p_user_skill_id AND user_id = auth.uid();

  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;