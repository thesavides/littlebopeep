'use client';

import { useState, useEffect } from 'react';
import { AlertCard } from './AlertCard';
import { Button, LoadingCard } from '@/components/ui';
import { useFarmerAlertsStore, useUIStore } from '@/store';
import { Bell, Filter, RefreshCw, Settings, Clock } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import type { AlertWithReport, Report } from '@/types';

// Demo data generator
function generateDemoAlerts(): AlertWithReport[] {
  const statuses: ('pending' | 'claimed' | 'resolved')[] = ['pending', 'pending', 'claimed', 'resolved'];
  const tags = [
    ['alone', 'near_road'],
    ['in_town', 'looks_distressed'],
    ['multiple_sheep', 'near_road'],
    ['alone', 'injured'],
  ];
  
  return statuses.map((status, i) => ({
    id: generateId(),
    report_id: generateId(),
    farmer_id: 'demo-farmer',
    action: status === 'pending' ? null : status === 'claimed' ? 'mine' : 'resolved',
    notified_at: new Date(Date.now() - i * 3600000).toISOString(),
    viewed_at: i > 0 ? new Date(Date.now() - i * 1800000).toISOString() : null,
    action_at: status !== 'pending' ? new Date(Date.now() - i * 600000).toISOString() : null,
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
    report: {
      id: generateId(),
      walker_id: generateId(),
      lat: 54.5 + (Math.random() - 0.5) * 0.1,
      lng: -2.5 + (Math.random() - 0.5) * 0.1,
      geohash: 'gcw2',
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      updated_at: new Date(Date.now() - i * 3600000).toISOString(),
      tags: tags[i] as Report['tags'],
      photo_url: i % 2 === 0 ? 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400&h=300&fit=crop' : null,
      description: i === 0 ? 'Spotted near the old barn, seemed to be wandering alone.' : null,
      status,
      claimed_by: status !== 'pending' ? 'demo-farmer' : null,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    },
    distance_km: 0.5 + i * 1.2,
  }));
}

export function FarmerDashboard() {
  const { alerts, filter, isLoading, setAlerts, setLoading, setFilter, updateAlert } = useFarmerAlertsStore();
  const { showToast } = useUIStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load demo data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAlerts(generateDemoAlerts());
      setLoading(false);
    }, 800);
  }, [setAlerts, setLoading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setAlerts(generateDemoAlerts());
    setIsRefreshing(false);
    showToast('Alerts refreshed', 'info');
  };

  const handleAction = (alertId: string, action: 'mine' | 'not_mine' | 'resolved') => {
    updateAlert(alertId, {
      action,
      action_at: new Date().toISOString(),
      report: {
        ...alerts.find((a) => a.id === alertId)!.report,
        status: action === 'mine' ? 'claimed' : action === 'resolved' ? 'resolved' : 'dismissed',
        claimed_by: action === 'mine' ? 'demo-farmer' : null,
        resolved_at: action === 'resolved' ? new Date().toISOString() : null,
      },
    });
    
    const messages = {
      mine: 'Report claimed - you\'ll be notified when to mark as resolved',
      not_mine: 'Report dismissed',
      resolved: 'Report marked as resolved - thank you!',
    };
    showToast(messages[action], 'success');
    setExpandedId(null);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.report.status === filter;
  });

  const pendingCount = alerts.filter((a) => a.report.status === 'pending').length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-stone-700" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-900">Your Alerts</h1>
                <p className="text-sm text-stone-500">
                  {pendingCount > 0
                    ? `${pendingCount} sighting${pendingCount > 1 ? 's' : ''} need attention`
                    : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className={cn(isRefreshing && 'animate-spin')}
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => window.location.href = '/farmer/settings'}
                variant="ghost"
                size="sm"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'claimed', label: 'Claimed' },
              { key: 'resolved', label: 'Resolved' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                  filter === f.key
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                {f.label}
                {f.key === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-700">No alerts here</h3>
            <p className="text-stone-500 mt-1">
              {filter === 'all'
                ? 'No sheep sightings in your area yet'
                : `No ${filter} alerts`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAction={handleAction}
                isExpanded={expandedId === alert.id}
                onToggle={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
