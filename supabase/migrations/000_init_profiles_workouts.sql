-- ============================================================
-- Migration 000: Core tables — profiles, workouts, storage
-- Run BEFORE migrations 001 and 002
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────────────────────
-- One row per user, auto-created by auth trigger on sign-up.

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  username        TEXT UNIQUE,
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'user',   -- 'user' | 'trainer'
  streak          INTEGER NOT NULL DEFAULT 0,
  wallet_address  TEXT,
  -- added by migration 002 (safe to include here for fresh installs):
  last_workout_date   DATE,
  total_workouts      INTEGER NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  fitness_goal        TEXT,
  preferred_workout   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile row whenever a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_timestamp();

-- ─── RLS: profiles ────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read public profile fields
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

-- Only the owner can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- System (trigger) can insert; block manual inserts from anon
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── workouts ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workouts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT,
  note        TEXT,
  photo_url   TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workouts_user_id_idx      ON workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_created_at_idx   ON workouts(created_at DESC);
CREATE INDEX IF NOT EXISTS workouts_is_public_idx    ON workouts(is_public) WHERE is_public = TRUE;

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Public workouts are readable by all authenticated users
CREATE POLICY "workouts_select_public" ON workouts
  FOR SELECT USING (is_public = TRUE OR auth.uid() = user_id);

-- Only the owner can insert their own workouts
CREATE POLICY "workouts_insert_own" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only the owner can update their own workouts
CREATE POLICY "workouts_update_own" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Only the owner can delete their own workouts
CREATE POLICY "workouts_delete_own" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- ─── Realtime ─────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE workouts;

-- ─── Storage: workout-photos bucket ──────────────────────────────────────────
-- Create bucket if it doesn't exist (safe to re-run)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workout-photos',
  'workout-photos',
  TRUE,
  5242880,  -- 5 MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder (user_id/filename)
CREATE POLICY "workout_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workout-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Anyone can view public photos
CREATE POLICY "workout_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'workout-photos');

-- Only the owner can delete their photos
CREATE POLICY "workout_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'workout-photos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ─── Backfill existing auth users who have no profile row ────────────────────
-- (safe for fresh installs — just inserts nothing if no users exist)

INSERT INTO profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'role', 'user')
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;
