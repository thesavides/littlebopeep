-- Migration: Internationalization (i18n) Support
-- Version: v1.4.0
-- Date: January 11, 2026
-- Description: Database-driven translations for multi-language support

-- =====================================================
-- Table: languages
-- Purpose: Define supported languages in the app
-- =====================================================
CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,                    -- ISO 639-1 code (e.g., 'en', 'cy', 'ga', 'gd')
  name_native TEXT NOT NULL,                -- Native name (e.g., 'Cymraeg', 'Gaeilge')
  name_english TEXT NOT NULL,               -- English name (e.g., 'Welsh', 'Irish')
  flag_emoji TEXT,                          -- Flag emoji (e.g., '🏴󠁧󠁢󠁷󠁬󠁳󠁿', '🇮🇪')
  enabled BOOLEAN DEFAULT true,             -- Is this language active?
  display_order INTEGER DEFAULT 0,          -- Sort order in language selector
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_languages_enabled ON languages(enabled, display_order);

-- Insert initial supported languages
INSERT INTO languages (code, name_native, name_english, flag_emoji, display_order) VALUES
  ('en', 'English', 'English', '🇬🇧', 1),
  ('cy', 'Cymraeg', 'Welsh', '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 2),
  ('ga', 'Gaeilge', 'Irish', '🇮🇪', 3),
  ('gd', 'Gàidhlig', 'Scottish Gaelic', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 4)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- Table: translations
-- Purpose: Store all UI strings with translations
-- =====================================================
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,                        -- Translation key (e.g., 'header.report_sheep')
  language_code TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  value TEXT NOT NULL,                      -- Translated string
  context TEXT,                             -- Optional context for translators
  namespace TEXT DEFAULT 'common',          -- Group translations (auth, reports, farms, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique key per language
  UNIQUE(key, language_code)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_namespace ON translations(namespace);
CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(language_code, namespace);

-- =====================================================
-- Table: translation_metadata
-- Purpose: Track translation status and quality
-- =====================================================
CREATE TABLE IF NOT EXISTS translation_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key TEXT NOT NULL,
  language_code TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
  is_ai_generated BOOLEAN DEFAULT false,    -- Was this auto-translated by AI?
  is_verified BOOLEAN DEFAULT false,        -- Has a human verified this?
  verified_by TEXT,                         -- User ID who verified
  verified_at TIMESTAMPTZ,
  notes TEXT,                               -- Translator notes
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(translation_key, language_code),
  FOREIGN KEY (translation_key, language_code)
    REFERENCES translations(key, language_code)
    ON DELETE CASCADE
);

-- =====================================================
-- Note: preferred_language column for users table
-- will be added later when user authentication is implemented
-- =====================================================

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_metadata ENABLE ROW LEVEL SECURITY;

-- Languages: Public read access
CREATE POLICY "Languages are viewable by everyone"
  ON languages FOR SELECT
  USING (true);

-- Translations: Public read access
CREATE POLICY "Translations are viewable by everyone"
  ON translations FOR SELECT
  USING (true);

-- Translation metadata: Public read access
CREATE POLICY "Translation metadata is viewable by everyone"
  ON translation_metadata FOR SELECT
  USING (true);

-- Admin-only write policies (implement admin authentication later)
-- For now, allow service role to write
CREATE POLICY "Admins can insert languages"
  ON languages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update languages"
  ON languages FOR UPDATE
  USING (true);

CREATE POLICY "Admins can insert translations"
  ON translations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update translations"
  ON translations FOR UPDATE
  USING (true);

CREATE POLICY "Admins can insert translation metadata"
  ON translation_metadata FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update translation metadata"
  ON translation_metadata FOR UPDATE
  USING (true);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get translation by key and language
CREATE OR REPLACE FUNCTION get_translation(
  p_key TEXT,
  p_language_code TEXT DEFAULT 'en'
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_translation TEXT;
BEGIN
  SELECT value INTO v_translation
  FROM translations
  WHERE key = p_key AND language_code = p_language_code;

  -- Fallback to English if translation not found
  IF v_translation IS NULL THEN
    SELECT value INTO v_translation
    FROM translations
    WHERE key = p_key AND language_code = 'en';
  END IF;

  -- Return key if still not found
  RETURN COALESCE(v_translation, p_key);
END;
$$;

-- Function to bulk insert translations
CREATE OR REPLACE FUNCTION upsert_translation(
  p_key TEXT,
  p_language_code TEXT,
  p_value TEXT,
  p_namespace TEXT DEFAULT 'common',
  p_context TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO translations (key, language_code, value, namespace, context)
  VALUES (p_key, p_language_code, p_value, p_namespace, p_context)
  ON CONFLICT (key, language_code)
  DO UPDATE SET
    value = EXCLUDED.value,
    namespace = EXCLUDED.namespace,
    context = EXCLUDED.context,
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Function to get all translations for a language
CREATE OR REPLACE FUNCTION get_all_translations(
  p_language_code TEXT DEFAULT 'en'
)
RETURNS TABLE (
  key TEXT,
  value TEXT,
  namespace TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT t.key, t.value, t.namespace
  FROM translations t
  WHERE t.language_code = p_language_code
  ORDER BY t.namespace, t.key;
END;
$$;

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE languages IS 'Supported languages in the application';
COMMENT ON TABLE translations IS 'All UI strings with translations';
COMMENT ON TABLE translation_metadata IS 'Metadata about translation quality and verification';

COMMENT ON COLUMN translations.key IS 'Namespaced translation key (e.g., auth.login.title)';
COMMENT ON COLUMN translations.namespace IS 'Group translations by feature (auth, reports, farms, etc.)';
COMMENT ON COLUMN translations.context IS 'Additional context for translators';

COMMENT ON FUNCTION get_translation IS 'Get a single translation with English fallback';
COMMENT ON FUNCTION upsert_translation IS 'Insert or update a translation';
COMMENT ON FUNCTION get_all_translations IS 'Get all translations for a language';
