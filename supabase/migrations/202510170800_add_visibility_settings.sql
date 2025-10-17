-- Add visibility settings for challenges, accounts, and scoreboard
-- These settings control who can view different sections of the platform

-- Create visibility mode enum
CREATE TYPE visibility_mode AS ENUM ('public', 'private', 'admin');

-- Insert default visibility configurations
-- All default to 'public' for backward compatibility

-- Challenges visibility: public (anyone), private (logged in only), admin (admin only)
INSERT INTO configs (key, value, type, description, editable, created_at, updated_at)
VALUES (
  'challenges_visibility',
  'public',
  'STRING',
  'Controls who can view challenges: public (anyone), private (logged in only), admin (admin only)',
  true,
  NOW(),
  NOW()
) ON CONFLICT (key) DO NOTHING;

-- Accounts visibility (users and teams): public (anyone), private (logged in only), admin (admin only)
INSERT INTO configs (key, value, type, description, editable, created_at, updated_at)
VALUES (
  'accounts_visibility',
  'public',
  'STRING',
  'Controls who can view user and team lists: public (anyone), private (logged in only), admin (admin only)',
  true,
  NOW(),
  NOW()
) ON CONFLICT (key) DO NOTHING;

-- Scoreboard visibility: public (anyone), private (logged in only), admin (admin only)
INSERT INTO configs (key, value, type, description, editable, created_at, updated_at)
VALUES (
  'scoreboard_visibility',
  'public',
  'STRING',
  'Controls who can view the scoreboard: public (anyone), private (logged in only), admin (admin only)',
  true,
  NOW(),
  NOW()
) ON CONFLICT (key) DO NOTHING;

-- Create indexes for faster config lookups
CREATE INDEX IF NOT EXISTS idx_configs_key ON configs(key);
