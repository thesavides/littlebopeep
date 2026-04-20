-- Migration 015: Category name translations + category image on reports

-- Add name_translations to report_categories for multi-language support
ALTER TABLE report_categories
  ADD COLUMN IF NOT EXISTS name_translations jsonb DEFAULT NULL;

-- Add category_image_url to sheep_reports so map markers can use the correct image
ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS category_image_url text DEFAULT NULL;
