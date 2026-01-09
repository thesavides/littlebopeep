'use client';

import { Button, Checkbox } from '@/components/ui';
import { Shield, Dog, Phone, AlertTriangle } from 'lucide-react';
import { useReportFormStore } from '@/store';

export function SafetyStep() {
  const {
    safetyAcknowledged,
    acknowledgeSafety,
    setStep,
  } = useReportFormStore();

  const handleContinue = () => {
    setStep('confirm');
  };

  const handleBack = () => {
    setStep('evidence');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-stone-100">
        <h2 className="text-xl font-bold text-stone-900">Safety reminder</h2>
        <p className="text-stone-500 mt-1">Please read before submitting</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        <div className="space-y-4">
          {/* Safety card 1 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Do not approach</h3>
              <p className="text-sm text-amber-700 mt-1">
                Never chase, corner, or try to catch the sheep. This can cause injury to the animal and yourself.
              </p>
            </div>
          </div>

          {/* Safety card 2 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <Dog className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Keep dogs on lead</h3>
              <p className="text-sm text-stone-600 mt-1">
                If you have a dog with you, keep them on a short lead and move away calmly.
              </p>
            </div>
          </div>

          {/* Safety card 3 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Road safety</h3>
              <p className="text-sm text-stone-600 mt-1">
                If the sheep is near a road, do not attempt to herd it. Your report will alert the farmer quickly.
              </p>
            </div>
          </div>

          {/* Emergency info */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50 border border-red-200">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Emergency situations</h3>
              <p className="text-sm text-red-700 mt-1">
                If the animal is severely injured or causing an immediate road hazard, call <strong>101</strong> (police non-emergency) or <strong>999</strong> in an emergency.
              </p>
            </div>
          </div>

          {/* Acknowledgment checkbox */}
          <div className="pt-4">
            <Checkbox
              label="I understand and will follow these safety guidelines"
              checked={safetyAcknowledged}
              onChange={(e) => {
                if (e.target.checked) acknowledgeSafety();
              }}
            />
          </div>
        </div>
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
          disabled={!safetyAcknowledged}
          className="flex-1"
          size="lg"
          rightIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          }
        >
          Review & Submit
        </Button>
      </div>
    </div>
  );
}
