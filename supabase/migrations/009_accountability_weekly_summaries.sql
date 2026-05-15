-- Cached weekly accountability summaries
-- One row per user, week, and prompt tone. Regenerated when workout state changes.

CREATE TABLE IF NOT EXISTS accountability_weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  prompt_tone TEXT NOT NULL DEFAULT 'direct',
  summary TEXT NOT NULL,
  provider TEXT NOT NULL,
  fallback BOOLEAN NOT NULL DEFAULT FALSE,
  workout_count INTEGER NOT NULL DEFAULT 0,
  latest_workout_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start, prompt_tone)
);

CREATE INDEX IF NOT EXISTS accountability_weekly_summaries_user_week_idx
  ON accountability_weekly_summaries(user_id, week_start DESC);

ALTER TABLE accountability_weekly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accountability_weekly_summaries_select_own"
  ON accountability_weekly_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "accountability_weekly_summaries_insert_own"
  ON accountability_weekly_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accountability_weekly_summaries_update_own"
  ON accountability_weekly_summaries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_accountability_weekly_summaries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS accountability_weekly_summaries_updated_at
  ON accountability_weekly_summaries;

CREATE TRIGGER accountability_weekly_summaries_updated_at
  BEFORE UPDATE ON accountability_weekly_summaries
  FOR EACH ROW EXECUTE FUNCTION update_accountability_weekly_summaries_timestamp();
