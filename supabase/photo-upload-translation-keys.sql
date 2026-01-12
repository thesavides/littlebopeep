-- Translation keys for photo upload feature
-- Namespace: walker
-- Feature: Photo upload in Step 2 of reporting flow
-- Date: January 12, 2026

INSERT INTO translations (key, language_code, value, namespace, context)
VALUES
  -- Photo upload UI
  ('walker.photos', 'en', 'Photos (optional)', 'walker', 'Label for photo upload section in Step 2'),
  ('walker.photoHelp', 'en', 'Photos help farmers identify the sheep. Max 3 photos.', 'walker', 'Help text below photo upload'),
  ('walker.addPhotos', 'en', 'Add Photos', 'walker', 'Button to open file selector'),
  ('walker.photoFormats', 'en', 'JPEG, PNG, WebP • Max 5MB', 'walker', 'Supported file formats and size'),
  ('walker.selectedPhotos', 'en', 'Selected Photos', 'walker', 'Header for selected but not yet uploaded photos'),
  ('walker.uploadPhotos', 'en', 'Upload Photos', 'walker', 'Button to start upload'),
  ('walker.uploading', 'en', 'Uploading...', 'walker', 'Button text while uploading'),
  ('walker.uploadedPhotos', 'en', '{{count}} photo(s) uploaded', 'walker', 'Success message with count'),

  -- Error messages
  ('walker.photoMaxExceeded', 'en', 'Maximum {{max}} photos allowed', 'walker', 'Error when trying to add too many photos'),
  ('walker.noPhotosSelected', 'en', 'No photos selected', 'walker', 'Error when trying to upload without selecting'),
  ('walker.somePhotosFailed', 'en', '{{count}} photo(s) failed to upload', 'walker', 'Warning when some uploads fail'),
  ('walker.uploadFailed', 'en', 'Upload failed. Please try again.', 'walker', 'Generic upload failure message')
ON CONFLICT (key, language_code)
DO UPDATE SET
  value = EXCLUDED.value,
  context = EXCLUDED.context,
  updated_at = CURRENT_TIMESTAMP;
