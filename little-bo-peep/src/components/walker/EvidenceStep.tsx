'use client';

import { useRef, useState } from 'react';
import { Button, Tag } from '@/components/ui';
import { Camera, Image, X, AlertCircle } from 'lucide-react';
import { useReportFormStore } from '@/store';
import { TAG_LABELS } from '@/lib/utils';
import type { SheepTag } from '@/types';

const AVAILABLE_TAGS: SheepTag[] = [
  'alone',
  'near_road',
  'in_town',
  'looks_distressed',
  'multiple_sheep',
  'injured',
  'other',
];

export function EvidenceStep() {
  const {
    photo,
    photoPreview,
    tags,
    description,
    setPhoto,
    toggleTag,
    setDescription,
    setStep,
  } = useReportFormStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Validation: need photo OR at least 2 tags
  const isValid = photo !== null || tags.length >= 2;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto(file, e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removePhoto = () => {
    setPhoto(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    setStep('safety');
  };

  const handleBack = () => {
    setStep('location');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-stone-100">
        <h2 className="text-xl font-bold text-stone-900">Add evidence</h2>
        <p className="text-stone-500 mt-1">
          Add a photo <strong>or</strong> select at least 2 tags
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 space-y-6">
        {/* Photo upload */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-3">
            Photo (optional but helpful)
          </label>
          
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden bg-stone-100">
              <img
                src={photoPreview}
                alt="Sheep sighting"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={removePhoto}
                className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/50 text-white hover:bg-stone-900/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-stone-700">
                    Take or upload a photo
                  </p>
                  <p className="text-sm text-stone-500 mt-1">
                    Tap to open camera, or drag & drop
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-3">
            What did you notice?{' '}
            {!photo && tags.length < 2 && (
              <span className="font-normal text-amber-600">
                (select at least 2 if no photo)
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <Tag
                key={tag}
                selected={tags.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                {TAG_LABELS[tag]}
              </Tag>
            ))}
          </div>
        </div>

        {/* Optional description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-stone-700 mb-2"
          >
            Additional details (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any other helpful information..."
            className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none resize-none transition-colors"
            rows={3}
          />
        </div>

        {/* Validation message */}
        {!isValid && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Please add a photo or select at least 2 tags to help identify the sheep.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 bg-white border-t border-stone-100 flex gap-3">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!isValid}
          className="flex-1"
          size="lg"
          rightIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
