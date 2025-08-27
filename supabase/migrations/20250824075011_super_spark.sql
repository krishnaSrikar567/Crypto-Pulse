/*
  # Update Alerts Schema for Supabase Auth

  1. Changes
    - Modify user_id column to use UUID type (compatible with Supabase auth.users)
    - Update foreign key reference to auth.users
    - Add indexes for better performance
    - Add triggered_at column to track when alerts are triggered

  2. Security
    - Maintain existing RLS policies
    - Ensure proper user isolation
*/

-- First, drop existing foreign key constraint if it exists
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_user_id_fkey;

-- Modify user_id column to be UUID and reference auth.users
ALTER TABLE alerts 
  ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid,
  ADD CONSTRAINT alerts_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Add triggered_at column if it doesn't exist
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS triggered_at TIMESTAMP;

-- Update indexes for better performance with UUID
DROP INDEX IF EXISTS idx_alerts_user_coin;
DROP INDEX IF EXISTS idx_alerts_triggered;

CREATE INDEX idx_alerts_user_coin ON alerts(user_id, coin, triggered);
CREATE INDEX idx_alerts_triggered ON alerts(triggered) WHERE triggered = FALSE;
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at) WHERE triggered_at IS NOT NULL;