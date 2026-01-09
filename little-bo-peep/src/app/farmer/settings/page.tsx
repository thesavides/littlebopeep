'use client';

import { useState } from 'react';
import { Button, Input, Checkbox } from '@/components/ui';
import { useUIStore } from '@/store';
import { 
  Bell, 
  Mail, 
  Phone, 
  Volume2, 
  VolumeX, 
  Shield, 
  CreditCard,
  LogOut,
  ChevronRight,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FarmerSettingsPage() {
  const { showToast } = useUIStore();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    showToast('Settings saved successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-stone-900">Settings</h1>
          <p className="text-sm text-stone-500">Manage your alerts and account</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Notification Settings */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-stone-900">Notifications</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">Push notifications</p>
                  <p className="text-sm text-stone-500">Instant alerts on your device</p>
                </div>
              </div>
              <button
                onClick={() => setPushAlerts(!pushAlerts)}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  pushAlerts ? 'bg-emerald-600' : 'bg-stone-200'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-1 transition-transform',
                    pushAlerts ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">Email alerts</p>
                  <p className="text-sm text-stone-500">Summary of new sightings</p>
                </div>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  emailAlerts ? 'bg-emerald-600' : 'bg-stone-200'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-1 transition-transform',
                    emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="font-medium text-stone-800">SMS alerts</p>
                  <p className="text-sm text-stone-500">Text message notifications</p>
                </div>
              </div>
              <button
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  smsAlerts ? 'bg-emerald-600' : 'bg-stone-200'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-1 transition-transform',
                    smsAlerts ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Mute Settings */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-amber-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              )}
              <h2 className="font-semibold text-stone-900">Quiet Hours</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-800">Mute all alerts</p>
                <p className="text-sm text-stone-500">
                  Temporarily pause notifications
                </p>
              </div>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  isMuted ? 'bg-amber-500' : 'bg-stone-200'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white shadow absolute top-1 transition-transform',
                    isMuted ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
            {isMuted && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  Alerts are currently muted. You won&apos;t receive notifications until you unmute.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Account */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-stone-900">Account</h2>
            </div>
          </div>
          <div className="divide-y divide-stone-100">
            <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-stone-400" />
                <span className="text-stone-700">Subscription</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-emerald-600 font-medium">Active</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-stone-400" />
                <span className="text-stone-700">Privacy & Data</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-red-600">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Save button */}
        <Button
          onClick={handleSave}
          className="w-full"
          size="lg"
          isLoading={isSaving}
        >
          Save Changes
        </Button>

        {/* Version info */}
        <div className="text-center text-sm text-stone-400 py-4">
          Little Bo Peep v1.0.0
        </div>
      </main>
    </div>
  );
}
