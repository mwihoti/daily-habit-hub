-- Migration 003: Add encrypted wallet backup columns to profiles
-- Enables PIN-encrypted cross-device wallet recovery via Supabase

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS encrypted_wallet_key TEXT,
  ADD COLUMN IF NOT EXISTS wallet_key_iv        TEXT,
  ADD COLUMN IF NOT EXISTS wallet_key_salt      TEXT;

COMMENT ON COLUMN profiles.encrypted_wallet_key IS 'AES-GCM encrypted private key (base64). Never stored in plaintext.';
COMMENT ON COLUMN profiles.wallet_key_iv        IS 'AES-GCM IV (base64, 12 bytes).';
COMMENT ON COLUMN profiles.wallet_key_salt      IS 'PBKDF2 salt (base64, 16 bytes).';
