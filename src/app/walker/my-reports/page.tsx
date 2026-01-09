'use client';

import { useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { StaticMap } from '@/components/map/Map';
import { Clock, MapPin, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime, TAG_LABELS, STATUS_CONFIG, generateId } from '@/lib/utils';
import type { Report } from '@/types';

const demoReports: Report[] = [
  {
    id: generateId(),
    walker_id: 'demo',
    lat: 54.5123,
    lng: -2.4567,
    geohash: 'gcw2',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    tags: ['alone', 'near_road'],
    photo_url: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400&h=300&fit=crop',
    description: 'Spotted near the old barn',
    status: 'claimed',
    claimed_by: 'farmer-1',
    resolved_at: null,
  },
  {
    id: generateId(),
    walker_id: 'demo',
    lat: 54.4987,
    lng: -2.5234,
    geohash: 'gcw2',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    tags: ['in_town', 'looks_distressed'],
    photo_url: null,
    description: null,
    status: 'resolved',
    claimed_by: 'farmer-2',
    resolved_at: new Date(Date.now() - 20 * 3600000).toISOString(),
  },
];

export default function MyReportsPage() {
  const [reports] = useState<Report[]>(demoReports);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 safe-area-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-stone-900">My Reports</h1>
              <p className="text-sm text-stone-500">{reports.length} sightings reported</p>
            </div>
            <Link href="/walker/report">
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                New Report
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4">
        {reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐑</div>
            <h3 className="text-lg font-semibold text-stone-700 mb-2">No reports yet</h3>
            <p className="text-stone-500 mb-6">Spot a sheep? Be the first to help.</p>
            <Link href="/walker/report">
              <Button leftIcon={<Plus className="w-5 h-5" />}>Report a Sheep</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
              const isExpanded = expandedId === report.id;

              return (
                <div key={report.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-stone-50"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      {report.photo_url ? (
                        <img src={report.photo_url} alt="Sheep" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🐑</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant={report.status === 'resolved' ? 'success' : 'info'} size="sm">
                        {status.label}
                      </Badge>
                      <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(report.created_at)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-stone-100 p-4 space-y-4">
                      <StaticMap lat={report.lat} lng={report.lng} zoom={14} className="h-32 rounded-xl" />
                      {report.photo_url && (
                        <img src={report.photo_url} alt="Sheep sighting" className="w-full h-40 object-cover rounded-xl" />
                      )}
                      <div className="flex flex-wrap gap-1">
                        {report.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-stone-100 text-xs text-stone-600">
                            {TAG_LABELS[tag]}
                          </span>
                        ))}
                      </div>
                      {report.status === 'resolved' && (
                        <div className="p-3 rounded-xl bg-emerald-50 text-sm text-emerald-700">
                          ✓ Sheep successfully recovered! Thank you for your help.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
