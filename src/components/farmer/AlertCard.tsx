'use client';

import { useState } from 'react';
import { Badge, Button, ConfirmModal } from '@/components/ui';
import { StaticMap } from '@/components/map/Map';
import { 
  Clock, 
  MapPin, 
  Tag as TagIcon, 
  Navigation, 
  Check, 
  X, 
  CheckCircle,
  ExternalLink 
} from 'lucide-react';
import { cn, formatRelativeTime, TAG_LABELS, STATUS_CONFIG } from '@/lib/utils';
import { formatDistance } from '@/lib/geo';
import type { AlertWithReport } from '@/types';

interface AlertCardProps {
  alert: AlertWithReport;
  onAction: (alertId: string, action: 'mine' | 'not_mine' | 'resolved') => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function AlertCard({ alert, onAction, isExpanded, onToggle }: AlertCardProps) {
  const [showConfirmMine, setShowConfirmMine] = useState(false);
  const [showConfirmResolved, setShowConfirmResolved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { report } = alert;
  const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;

  const handleAction = async (action: 'mine' | 'not_mine' | 'resolved') => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onAction(alert.id, action);
    } finally {
      setIsLoading(false);
      setShowConfirmMine(false);
      setShowConfirmResolved(false);
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div
        className={cn(
          'bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200',
          report.status === 'pending'
            ? 'border-amber-200 shadow-lg shadow-amber-100'
            : 'border-stone-200',
          isExpanded && 'ring-2 ring-emerald-500 ring-offset-2'
        )}
      >
        {/* Header - clickable for expansion */}
        <button
          onClick={onToggle}
          className="w-full p-4 flex items-start gap-4 text-left hover:bg-stone-50 transition-colors"
        >
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
            {report.photo_url ? (
              <img
                src={report.photo_url}
                alt="Sheep sighting"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                🐑
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    report.status === 'pending'
                      ? 'warning'
                      : report.status === 'claimed'
                      ? 'info'
                      : 'success'
                  }
                  size="sm"
                >
                  {status.label}
                </Badge>
                <span className="text-sm text-stone-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelativeTime(report.created_at)}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4 text-sm text-stone-600">
              <span className="flex items-center gap-1">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <strong>{formatDistance(alert.distance_km)}</strong> away
              </span>
            </div>

            {/* Tags preview */}
            <div className="mt-2 flex flex-wrap gap-1">
              {report.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-stone-100 text-xs text-stone-600"
                >
                  {TAG_LABELS[tag]}
                </span>
              ))}
              {report.tags.length > 3 && (
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-xs text-stone-500">
                  +{report.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-stone-100">
            {/* Photo */}
            {report.photo_url && (
              <div className="relative">
                <img
                  src={report.photo_url}
                  alt="Sheep sighting"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Map */}
            <div className="relative h-40">
              <StaticMap
                lat={report.lat}
                lng={report.lng}
                zoom={15}
                className="h-full rounded-none"
              />
              <button
                onClick={openInMaps}
                className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-4 space-y-4">
              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-stone-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-700">Location</p>
                  <p className="text-sm text-stone-500 font-mono">
                    {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                  </p>
                </div>
              </div>

              {/* All tags */}
              <div className="flex items-start gap-3">
                <TagIcon className="w-5 h-5 text-stone-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-700">Observations</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {report.tags.map((tag) => (
                      <Badge key={tag} size="sm">
                        {TAG_LABELS[tag]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              {report.description && (
                <div className="p-3 rounded-xl bg-stone-50 text-sm text-stone-600">
                  {report.description}
                </div>
              )}
            </div>

            {/* Actions */}
            {report.status === 'pending' && (
              <div className="p-4 border-t border-stone-100 flex gap-3">
                <Button
                  onClick={() => handleAction('not_mine')}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Not Mine
                </Button>
                <Button
                  onClick={() => setShowConfirmMine(true)}
                  className="flex-1"
                  disabled={isLoading}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  This is Mine
                </Button>
              </div>
            )}

            {report.status === 'claimed' && (
              <div className="p-4 border-t border-stone-100">
                <Button
                  onClick={() => setShowConfirmResolved(true)}
                  className="w-full"
                  disabled={isLoading}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Mark as Resolved
                </Button>
              </div>
            )}

            {report.status === 'resolved' && (
              <div className="p-4 border-t border-stone-100 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Sheep recovered</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm modals */}
      <ConfirmModal
        isOpen={showConfirmMine}
        onClose={() => setShowConfirmMine(false)}
        onConfirm={() => handleAction('mine')}
        title="Claim this report?"
        message="This will notify other farmers that this sheep has been claimed. You can mark it as resolved once recovered."
        confirmLabel="Yes, This is Mine"
        isLoading={isLoading}
      />

      <ConfirmModal
        isOpen={showConfirmResolved}
        onClose={() => setShowConfirmResolved(false)}
        onConfirm={() => handleAction('resolved')}
        title="Mark as resolved?"
        message="This will close the report and notify us that the sheep has been recovered safely."
        confirmLabel="Mark Resolved"
        variant="default"
        isLoading={isLoading}
      />
    </>
  );
}
