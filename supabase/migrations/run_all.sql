-- ============================================================
-- Migration: Trainers & Messaging
-- ============================================================

-- trainer_profiles: extended profile for users with role = 'trainer'
CREATE TABLE IF NOT EXISTS trainer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  specialties TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT '{English}',
  availability TEXT,
  price_monthly INTEGER DEFAULT 0,        -- 1-on-1 monthly price in KES
  group_price_monthly INTEGER DEFAULT 0,  -- group monthly price in KES
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  client_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- conversations: one row per user <-> trainer pair
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_user INTEGER DEFAULT 0,    -- unread count for the regular user
  unread_trainer INTEGER DEFAULT 0, -- unread count for the trainer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trainer_id)
);

-- messages: individual messages inside a conversation
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE trainer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- trainer_profiles: anyone can read active profiles
CREATE POLICY "trainer_profiles_select" ON trainer_profiles
  FOR SELECT USING (is_active = TRUE);

-- trainer_profiles: only the owning trainer can insert/update their own profile
CREATE POLICY "trainer_profiles_insert" ON trainer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trainer_profiles_update" ON trainer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- conversations: participants (user or trainer) can see their conversations
CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = trainer_id);

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = trainer_id);

CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = trainer_id);

-- messages: only participants in the conversation can read/write
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_id = auth.uid() OR c.trainer_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_id = auth.uid() OR c.trainer_id = auth.uid())
    )
  );

-- ============================================================
-- Function: update updated_at on trainer_profiles
-- ============================================================
CREATE OR REPLACE FUNCTION update_trainer_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trainer_profiles_updated_at
  BEFORE UPDATE ON trainer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_trainer_profile_timestamp();

-- ============================================================
-- Enable realtime for messages and conversations
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
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
