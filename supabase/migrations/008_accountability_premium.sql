-- Premium accountability preferences
-- Stores lightweight retention and reminder state on the profile.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS accountability_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS accountability_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS accountability_reminder_hour INTEGER NOT NULL DEFAULT 19,
  ADD COLUMN IF NOT EXISTS accountability_last_summary_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accountability_preferred_prompt_tone TEXT NOT NULL DEFAULT 'direct';

COMMENT ON COLUMN profiles.accountability_tier IS 'free | premium_trial | premium';
COMMENT ON COLUMN profiles.accountability_reminder_enabled IS 'Whether the user opted into accountability reminders.';
COMMENT ON COLUMN profiles.accountability_reminder_hour IS 'Preferred reminder hour in 24h local time.';
COMMENT ON COLUMN profiles.accountability_last_summary_sent_at IS 'Last time a weekly accountability summary was sent.';
COMMENT ON COLUMN profiles.accountability_preferred_prompt_tone IS 'direct | supportive | intense';
