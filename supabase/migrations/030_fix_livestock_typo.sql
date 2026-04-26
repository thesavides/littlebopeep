-- Migration 030: Fix "Near lifestock" typo → "Near livestock" in Predator category

-- 1. Fix the English condition label in the conditions array
UPDATE report_categories
SET conditions = array_replace(conditions, 'Near lifestock', 'Near livestock')
WHERE name = 'Predator'
  AND 'Near lifestock' = ANY(conditions);

-- 2. Fix the key in condition_translations JSON (rename key in each language)
UPDATE report_categories
SET condition_translations = jsonb_build_object(
  'cy', (
    CASE WHEN condition_translations->'cy' ? 'Near lifestock'
    THEN (condition_translations->'cy') - 'Near lifestock' || jsonb_build_object('Near livestock', condition_translations->'cy'->'Near lifestock')
    ELSE condition_translations->'cy'
    END
  ),
  'ga', (
    CASE WHEN condition_translations->'ga' ? 'Near lifestock'
    THEN (condition_translations->'ga') - 'Near lifestock' || jsonb_build_object('Near livestock', condition_translations->'ga'->'Near lifestock')
    ELSE condition_translations->'ga'
    END
  ),
  'gd', (
    CASE WHEN condition_translations->'gd' ? 'Near lifestock'
    THEN (condition_translations->'gd') - 'Near lifestock' || jsonb_build_object('Near livestock', condition_translations->'gd'->'Near lifestock')
    ELSE condition_translations->'gd'
    END
  )
)
WHERE name = 'Predator'
  AND condition_translations IS NOT NULL;

-- 3. Fix typo in any existing reports that selected this condition
UPDATE sheep_reports
SET conditions = array_replace(conditions, 'Near lifestock', 'Near livestock')
WHERE 'Near lifestock' = ANY(conditions);

-- 4. Also fix the single condition field (legacy)
UPDATE sheep_reports
SET condition = 'Near livestock'
WHERE condition = 'Near lifestock';
