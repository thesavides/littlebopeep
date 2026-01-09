'use client';

import { useState } from 'react';
import { Map } from '@/components/map/Map';
import { Button, Input } from '@/components/ui';
import { Hexagon, Circle, Save, MapPin } from 'lucide-react';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import type { Coordinates, GeoJSON } from '@/types';

interface HoldingSetupProps {
  onSave?: (data: {
    holdingName: string;
    alertArea: GeoJSON | null;
    center: Coordinates | null;
    radiusKm: number;
  }) => void;
}

export function HoldingSetup({ onSave }: HoldingSetupProps) {
  const { showToast } = useUIStore();
  const [holdingName, setHoldingName] = useState('');
  const [drawMode, setDrawMode] = useState<'polygon' | 'radius'>('radius');
  const [center, setCenter] = useState<Coordinates | null>(null);
  const [radiusKm, setRadiusKm] = useState(2);
  const [isSaving, setIsSaving] = useState(false);

  const handleMapClick = (coords: Coordinates) => {
    setCenter(coords);
  };

  const handleSave = async () => {
    if (!holdingName.trim()) {
      showToast('Please enter a holding name', 'error');
      return;
    }
    if (!center) {
      showToast('Please set your alert area on the map', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave({
          holdingName: holdingName.trim(),
          alertArea: null, // Would be calculated from polygon or radius
          center,
          radiusKm,
        });
      }
      
      showToast('Holding saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save holding', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-stone-900">Set Up Your Holding</h1>
          <p className="text-sm text-stone-500">
            Define your alert area to receive sighting notifications
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Holding name */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <Input
            label="Holding Name"
            placeholder="e.g., Hillside Farm"
            value={holdingName}
            onChange={(e) => setHoldingName(e.target.value)}
            hint="This will help you identify alerts in your dashboard"
          />
        </div>

        {/* Draw mode selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-stone-700 mb-3">
            Alert Area Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDrawMode('radius')}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                drawMode === 'radius'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-stone-200 hover:border-stone-300'
              )}
            >
              <Circle
                className={cn(
                  'w-6 h-6 mb-2',
                  drawMode === 'radius' ? 'text-emerald-600' : 'text-stone-400'
                )}
              />
              <div className="font-semibold text-stone-800">Radius</div>
              <div className="text-sm text-stone-500">Simple circle around a point</div>
            </button>
            <button
              onClick={() => setDrawMode('polygon')}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                drawMode === 'polygon'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-stone-200 hover:border-stone-300'
              )}
            >
              <Hexagon
                className={cn(
                  'w-6 h-6 mb-2',
                  drawMode === 'polygon' ? 'text-emerald-600' : 'text-stone-400'
                )}
              />
              <div className="font-semibold text-stone-800">Custom Shape</div>
              <div className="text-sm text-stone-500">Draw your exact boundary</div>
            </button>
          </div>
        </div>

        {/* Radius slider (only for radius mode) */}
        {drawMode === 'radius' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-semibold text-stone-700 mb-3">
              Alert Radius: {radiusKm}km
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>0.5km</span>
              <span>5km</span>
              <span>10km</span>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-stone-700">
                {drawMode === 'radius'
                  ? 'Click to set your center point'
                  : 'Click to draw your boundary'}
              </span>
            </div>
            {center && (
              <p className="text-sm text-stone-500 mt-1 font-mono">
                {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
              </p>
            )}
          </div>
          <Map
            center={center || { lat: 54.5, lng: -2.5 }}
            zoom={center ? 12 : 6}
            onMapClick={handleMapClick}
            showUserLocation
            draggableMarker={drawMode === 'radius'}
            onDragEnd={setCenter}
            className="h-72"
            markers={
              center
                ? [
                    {
                      id: 'center',
                      lat: center.lat,
                      lng: center.lng,
                      type: 'pin',
                    },
                  ]
                : []
            }
          />
        </div>

        {/* Info */}
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
          <h3 className="font-semibold text-emerald-800 mb-2">
            How alerts work
          </h3>
          <ul className="text-sm text-emerald-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">•</span>
              You&apos;ll be notified when a sheep is spotted within your alert area
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">•</span>
              Alerts include location, photo (if available), and observations
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">•</span>
              You can adjust your alert area anytime in settings
            </li>
          </ul>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          className="w-full"
          size="lg"
          isLoading={isSaving}
          disabled={!holdingName.trim() || !center}
          leftIcon={<Save className="w-5 h-5" />}
        >
          Save Holding
        </Button>
      </main>
    </div>
  );
}
