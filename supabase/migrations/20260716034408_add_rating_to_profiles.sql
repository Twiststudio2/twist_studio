-- Add a rating column to profiles for creative ratings (1-5 stars)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating integer DEFAULT 0;
