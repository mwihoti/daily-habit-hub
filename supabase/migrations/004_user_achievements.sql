-- Migration 004: Track which milestone NFTs users have claimed
-- Milestones: genesis (1), iron_will (7), three_weeks (21), month_champion (30), consistency_legend (49)

CREATE TABLE IF NOT EXISTS user_achievements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone    TEXT NOT NULL,      -- 'genesis' | 'iron_will' | 'three_weeks' | 'month_champion' | 'consistency_legend'
  earned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at   TIMESTAMPTZ,        -- NULL = earned but not yet claimed
  is_on_chain  BOOLEAN NOT NULL DEFAULT false,
  tx_hash      TEXT,
  UNIQUE(user_id, milestone)
);

CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can read their own achievements
CREATE POLICY "achievements_select_own" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert/update their own rows (API route will validate eligibility)
CREATE POLICY "achievements_insert_own" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements_update_own" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);
