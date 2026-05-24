-- Chat presence and read receipts

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS profiles_last_seen_at_idx
  ON profiles(last_seen_at DESC);

CREATE INDEX IF NOT EXISTS messages_conversation_seen_at_idx
  ON messages(conversation_id, seen_at);
