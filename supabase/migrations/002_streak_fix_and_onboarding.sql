-- ============================================================
-- Migration 002: Fix streak logic + onboarding columns
-- ============================================================

-- Add missing columns to profiles (safe with IF NOT EXISTS guards)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_workout_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_workouts    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitness_goal     TEXT;         -- 'lose_weight' | 'build_muscle' | 'consistency' | 'get_healthier'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_workout TEXT;        -- 'home' | 'gym' | 'outdoor' | 'mixed'

-- ============================================================
-- Drop old broken function
-- ============================================================
DROP FUNCTION IF EXISTS increment_workout_count(uuid);

-- ============================================================
-- New streak-safe check-in function
--
-- Rules:
--   • Already checked in today?           → return current state unchanged
--   • Last workout was yesterday?         → streak++
--   • Last workout was before yesterday?  → streak resets to 1
--   • No previous workout?               → streak = 1
-- ============================================================
CREATE OR REPLACE FUNCTION record_checkin(p_user_id UUID)
RETURNS TABLE(new_streak INTEGER, new_total INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_date   DATE;
  v_streak      INTEGER;
  v_total       INTEGER;
  v_today       DATE := CURRENT_DATE;
BEGIN
  SELECT last_workout_date, streak, total_workouts
  INTO   v_last_date, v_streak, v_total
  FROM   profiles
  WHERE  id = p_user_id;

  -- Already checked in today — idempotent, just return current state
  IF v_last_date = v_today THEN
    RETURN QUERY SELECT COALESCE(v_streak, 0), COALESCE(v_total, 0);
    RETURN;
  END IF;

  -- Increment total workout count
  v_total := COALESCE(v_total, 0) + 1;

  -- Compute new streak
  IF v_last_date = v_today - INTERVAL '1 day' THEN
    -- Consecutive day
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    -- Gap detected — reset streak
    v_streak := 1;
  END IF;

  UPDATE profiles
  SET    streak            = v_streak,
         total_workouts    = v_total,
         last_workout_date = v_today
  WHERE  id = p_user_id;

  RETURN QUERY SELECT v_streak, v_total;
END;
$$;

-- ============================================================
-- Backfill total_workouts for existing users
-- (counts all existing workouts per user)
-- ============================================================
UPDATE profiles p
SET    total_workouts = (
  SELECT COUNT(*) FROM workouts w WHERE w.user_id = p.id
);

-- ============================================================
-- Backfill last_workout_date for existing users
-- ============================================================
UPDATE profiles p
SET    last_workout_date = (
  SELECT DATE(MAX(created_at)) FROM workouts w WHERE w.user_id = p.id
)
WHERE EXISTS (SELECT 1 FROM workouts w WHERE w.user_id = p.id);
