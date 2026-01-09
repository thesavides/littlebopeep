'use client';

import { useState } from 'react';
import { Badge, LoadingCard } from '@/components/ui';
import { StaticMap } from '@/components/map/Map';
import { Clock, MapPin, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime, TAG_LABELS, STATUS_CONFIG, generateId } from '@/lib/utils';
import type { Report } from '@/types';

// Demo data
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
  {
    id: generateId(),
    walker_id: 'demo',
    lat: 54.5456,
    lng: -2.3890,
    geohash: 'gcw2',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    tags: ['multiple_sheep', 'alone'],
    photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    description: 'Group of 3 sheep by the stream',
    status: 'resolved',
    claimed_by: 'farmer-1',
    resolved_at: new Date(Date.now() - 70 * 3600000).toISOString(),
  },
];

export default function MyReportsPage() {
  const [reports] = useState<Report[]>(demoReports);
  const [isLoading] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-stone-900">My Reports</h1>
              <p className="text-sm text-stone-500">
                {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
              </p>
            </div>
            <Link
              href="/walker/report"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐑</div>
            <h3 className="text-lg font-semibold text-stone-700">No reports yet</h3>
            <p className="text-stone-500 mt-1 mb-6">
              Spotted a sheep that might be lost? Report it!
            </p>
            <Link
              href="/walker/report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Report a Sheep
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden hover:border-stone-300 transition-colors"
                >
                  <div className="flex">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 flex-shrink-0">
                      {report.photo_url ? (
                        <img
                          src={report.photo_url}
                          alt="Sheep sighting"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <StaticMap
                          lat={report.lat}
                          lng={report.lng}
                          zoom={13}
                          className="w-full h-full rounded-none"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
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
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(report.created_at)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {report.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-stone-100 text-xs text-stone-600"
                          >
                            {TAG_LABELS[tag]}
                          </span>
                        ))}
                      </div>

                      {report.description && (
                        <p className="mt-2 text-sm text-stone-600 truncate">
                          {report.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status message */}
                  {report.status === 'claimed' && (
                    <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 text-sm text-blue-700">
                      A farmer has claimed this sheep 🎉
                    </div>
                  )}
                  {report.status === 'resolved' && (
                    <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 text-sm text-emerald-700">
                      Sheep recovered safely! Thank you for helping 🐑
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
