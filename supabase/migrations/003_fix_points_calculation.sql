-- Fix execute_spin to correctly calculate available points
-- Previous version read total_points directly (which now stores earned - spent)
-- and double-subtracted. New version sums all points_spent from daily_spins
-- to validate available budget correctly.

CREATE OR REPLACE FUNCTION public.execute_spin()
RETURNS JSONB
AS $$
DECLARE
  v_user_id UUID;
  v_spins_used INTEGER;
  v_max_spins INTEGER := 3;
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

  IF v_inventory_count >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Inventory full');
  END IF;

  v_new_spins_used := v_spins_used + 1;
  v_cost := CASE v_new_spins_used
    WHEN 1 THEN 0
    WHEN 2 THEN 2
    WHEN 3 THEN 4
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