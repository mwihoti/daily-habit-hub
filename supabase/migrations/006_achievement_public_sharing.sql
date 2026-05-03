-- Public achievement sharing
-- Allows users to share individual earned badges using a public slug.

ALTER TABLE user_achievements
  ADD COLUMN IF NOT EXISTS share_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS user_achievements_share_slug_idx
  ON user_achievements(share_slug)
  WHERE share_slug IS NOT NULL;

CREATE POLICY "achievements_select_public_shared" ON user_achievements
  FOR SELECT USING (is_public = TRUE);
