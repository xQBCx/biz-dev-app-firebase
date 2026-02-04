-- Add photo_url column to messages table to store photo references
ALTER TABLE messages ADD COLUMN IF NOT EXISTS photo_url text;