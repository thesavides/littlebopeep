-- Add photo_urls column to sheep_reports table
-- This will store an array of photo URLs from Supabase Storage

ALTER TABLE sheep_reports
ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN sheep_reports.photo_urls IS 'Array of Supabase Storage URLs for sheep photos (max 3 per report)';

-- Create index for better query performance if needed
CREATE INDEX IF NOT EXISTS idx_sheep_reports_photo_urls ON sheep_reports USING GIN (photo_urls);
