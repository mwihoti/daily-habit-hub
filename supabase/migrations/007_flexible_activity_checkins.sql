-- Flexible activity check-ins
-- Expands workouts into broader proof-of-progress entries without breaking existing rows.

ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS activity_title TEXT,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS energy_level TEXT,
  ADD COLUMN IF NOT EXISTS effort_level TEXT;

COMMENT ON COLUMN workouts.activity_title IS 'Human-readable activity title for public/community display.';
COMMENT ON COLUMN workouts.duration_minutes IS 'Optional time spent on the activity.';
COMMENT ON COLUMN workouts.energy_level IS 'Optional self-reported energy level.';
COMMENT ON COLUMN workouts.effort_level IS 'Optional self-reported effort level.';
