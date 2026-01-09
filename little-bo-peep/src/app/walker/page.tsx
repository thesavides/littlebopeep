'use client';

import Link from 'next/link';
import { Map } from '@/components/map/Map';
import { Button } from '@/components/ui';
import { Plus, MapPin, Bell, HelpCircle } from 'lucide-react';

export default function WalkerHomePage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐑</span>
            <span className="font-bold text-stone-900">Little Bo Peep</span>
          </div>
          <Link
            href="/walker/help"
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-stone-500" />
          </Link>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          showUserLocation
          className="h-full"
          zoom={12}
        />

        {/* Quick stats */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex gap-3">
            <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-stone-500">Your reports</div>
                  <div className="font-bold text-stone-900">3</div>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-stone-500">Sheep helped</div>
                  <div className="font-bold text-stone-900">2</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report button */}
        <Link
          href="/walker/report"
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <Button
            size="lg"
            className="shadow-xl shadow-emerald-200/50 px-8"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Report a Sheep
          </Button>
        </Link>
      </div>

      {/* Tips card */}
      <div className="bg-white border-t border-stone-200 p-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50">
          <div className="text-2xl">💡</div>
          <div>
            <p className="font-medium text-stone-800">Tip of the day</p>
            <p className="text-sm text-stone-600 mt-1">
              If you see a sheep near a road, keep your distance and report it quickly. 
              Don&apos;t try to move the animal yourself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
