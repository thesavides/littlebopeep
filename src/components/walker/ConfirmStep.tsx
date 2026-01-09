'use client';

import { useState } from 'react';
import { Button, Badge } from '@/components/ui';
import { StaticMap } from '@/components/map/Map';
import { MapPin, Tag, FileText, Check, Send, Loader2 } from 'lucide-react';
import { useReportFormStore, useUIStore, useWalkerReportsStore } from '@/store';
import { TAG_LABELS, generateId } from '@/lib/utils';
import { encodeGeohash } from '@/lib/geo';
import type { Report } from '@/types';

export function ConfirmStep() {
  const {
    location,
    photo,
    photoPreview,
    tags,
    description,
    isSubmitting,
    setSubmitting,
    setStep,
    reset,
  } = useReportFormStore();

  const { showToast } = useUIStore();
  const { addReport } = useWalkerReportsStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBack = () => {
    setStep('safety');
  };

  const handleSubmit = async () => {
    if (!location) return;
    
    setSubmitting(true);

    try {
      // Simulate API call - in production this would call the backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create the report object
      const report: Report = {
        id: generateId(),
        walker_id: 'demo-walker',
        lat: location.lat,
        lng: location.lng,
        geohash: encodeGeohash(location.lat, location.lng),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags,
        photo_url: photoPreview,
        description: description || null,
        status: 'pending',
        claimed_by: null,
        resolved_at: null,
      };

      // Add to local state
      addReport(report);
      
      // Show success
      setIsSuccess(true);
      showToast('Report submitted successfully!', 'success');

    } catch (error) {
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewReport = () => {
    reset();
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Thank you!
          </h2>
          <p className="text-stone-600 max-w-xs">
            You&apos;re helping sheep get home safely. The nearby farmer has been notified.
          </p>
          
          {/* Decorative sheep */}
          <div className="mt-8 text-6xl animate-in slide-in-from-bottom duration-500">
            🐑
          </div>
        </div>

        <div className="p-5 bg-white border-t border-stone-100 space-y-3">
          <Button
            onClick={handleNewReport}
            className="w-full"
            size="lg"
          >
            Report Another Sighting
          </Button>
          <Button
            onClick={() => window.location.href = '/walker'}
            variant="outline"
            className="w-full"
            size="lg"
          >
            View My Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-stone-100">
        <h2 className="text-xl font-bold text-stone-900">Review your report</h2>
        <p className="text-stone-500 mt-1">Please check the details are correct</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Location preview */}
        <div className="rounded-2xl overflow-hidden border-2 border-stone-200">
          <div className="p-4 bg-stone-50 flex items-center gap-3 border-b border-stone-200">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-stone-700">Location</span>
          </div>
          {location && (
            <StaticMap
              lat={location.lat}
              lng={location.lng}
              zoom={15}
              className="h-32"
            />
          )}
          <div className="p-3 text-sm text-stone-500 font-mono text-center bg-white">
            {location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}
          </div>
        </div>

        {/* Photo preview */}
        {photoPreview && (
          <div className="rounded-2xl overflow-hidden border-2 border-stone-200">
            <div className="p-4 bg-stone-50 flex items-center gap-3 border-b border-stone-200">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-stone-700">Photo</span>
            </div>
            <img
              src={photoPreview}
              alt="Sheep sighting"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Tags */}
        <div className="rounded-2xl overflow-hidden border-2 border-stone-200">
          <div className="p-4 bg-stone-50 flex items-center gap-3 border-b border-stone-200">
            <Tag className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-stone-700">Tags</span>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="success">
                {TAG_LABELS[tag]}
              </Badge>
            ))}
            {tags.length === 0 && (
              <span className="text-stone-400">No tags selected</span>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="rounded-2xl overflow-hidden border-2 border-stone-200">
            <div className="p-4 bg-stone-50 flex items-center gap-3 border-b border-stone-200">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-stone-700">Additional details</span>
            </div>
            <div className="p-4 text-stone-600">
              {description}
            </div>
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
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={isSubmitting ? undefined : <Send className="w-5 h-5" />}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </div>
  );
}
