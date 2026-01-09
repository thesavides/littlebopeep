'use client';

import { useReportFormStore } from '@/store';
import { LocationStep } from './LocationStep';
import { EvidenceStep } from './EvidenceStep';
import { SafetyStep } from './SafetyStep';
import { ConfirmStep } from './ConfirmStep';

export function ReportForm() {
  const { step } = useReportFormStore();

  const renderStep = () => {
    switch (step) {
      case 'location':
        return <LocationStep />;
      case 'evidence':
        return <EvidenceStep />;
      case 'safety':
        return <SafetyStep />;
      case 'confirm':
        return <ConfirmStep />;
      default:
        return <LocationStep />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Progress indicator */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {['location', 'evidence', 'safety', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-full h-1.5 rounded-full transition-colors ${
                  i <= ['location', 'evidence', 'safety', 'confirm'].indexOf(step)
                    ? 'bg-emerald-500'
                    : 'bg-stone-200'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-stone-500">
          <span>Location</span>
          <span>Evidence</span>
          <span>Safety</span>
          <span>Submit</span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        {renderStep()}
      </div>
    </div>
  );
}
