-- Migration 033: Update sheep-specific translation keys to generic countryside reporting copy

-- Map legend
UPDATE translations SET value = 'Recent reports (last 12h)'
  WHERE key = 'walker.reportedSheep12h' AND language = 'en';

-- Reporting tips
UPDATE translations SET value = 'Add a photo if it is safe to do so'
  WHERE key = 'walker.tip3' AND language = 'en';

UPDATE translations SET value = 'Report injured or distressed animals as a priority'
  WHERE key = 'walker.tip4' AND language = 'en';

UPDATE translations SET value = 'Keep a safe distance from any animals'
  WHERE key = 'walker.tip5' AND language = 'en';

-- Insert tip6 if it does not exist yet (may already be present if seed was re-run)
INSERT INTO translations (key, language, value, namespace)
VALUES ('walker.tip6', 'en', 'You can report any countryside issue — gates, fencing, fly-tipping, and more', 'walker')
ON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value;

-- Photo caption
UPDATE translations SET value = 'Photos help farmers identify the issue. Max 3 photos.'
  WHERE key = 'walker.photoHelp' AND language = 'en';

-- Description placeholder
UPDATE translations SET value = 'e.g., Near the old stone wall, on the south side of the footpath...'
  WHERE key = 'walker.detailsPlaceholder' AND language = 'en';
