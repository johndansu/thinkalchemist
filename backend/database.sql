-- Think Alchemist Database Schema
-- Run this in your Supabase SQL Editor

-- Forges table
CREATE TABLE IF NOT EXISTS forges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  input_text TEXT NOT NULL,
  output_json JSONB NOT NULL,
  alchemy_mode TEXT NOT NULL DEFAULT 'mixed', -- 'personas', 'timeline', 'purification', 'stress_test', 'world_building', 'mixed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_forges_user_id ON forges(user_id);
CREATE INDEX IF NOT EXISTS idx_forges_created_at ON forges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forges_alchemy_mode ON forges(alchemy_mode);

-- Enable Row Level Security
ALTER TABLE forges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own forges
CREATE POLICY IF NOT EXISTS "Users can view own forges"
  ON forges FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own forges
CREATE POLICY IF NOT EXISTS "Users can insert own forges"
  ON forges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own forges
CREATE POLICY IF NOT EXISTS "Users can update own forges"
  ON forges FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own forges
CREATE POLICY IF NOT EXISTS "Users can delete own forges"
  ON forges FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_forges_updated_at
  BEFORE UPDATE ON forges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

