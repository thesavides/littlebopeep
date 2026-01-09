'use client';

import { useState } from 'react';
import { Button, Input, Checkbox } from '@/components/ui';
import { Bell, Mail, MessageSquare, Moon, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store';

export default function SettingsPage() {
  const { showToast } = useUIStore();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    showToast('Settings saved successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-stone-900">Settings</h1>
          <p className="text-sm text-stone-500">Manage your alerts and preferences</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-stone-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <Checkbox
              label="Email alerts"
              description="Receive alerts via email"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
            />
            <Checkbox
              label="SMS alerts"
              description="Receive text message alerts (premium)"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
            />
            <Checkbox
              label="Push notifications"
              description="Receive alerts on your device"
              checked={pushAlerts}
              onChange={(e) => setPushAlerts(e.target.checked)}
            />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-stone-900">Quiet Hours</h2>
          </div>
          
          <Checkbox
            label="Enable quiet hours"
            description="Pause alerts during specific times"
            checked={quietHoursEnabled}
            onChange={(e) => setQuietHoursEnabled(e.target.checked)}
          />
          
          {quietHoursEnabled && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="Start time"
                defaultValue="22:00"
              />
              <Input
                type="time"
                label="End time"
                defaultValue="07:00"
              />
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-stone-900">Contact Information</h2>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              defaultValue="farmer@example.com"
            />
            <Input
              label="Phone number"
              type="tel"
              placeholder="+44 7XXX XXXXXX"
              hint="Required for SMS alerts"
            />
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-stone-400" />
              <span className="font-medium text-stone-700">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>
          <div className="border-t border-stone-100" />
          <button className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-stone-400" />
              <span className="font-medium text-stone-700">Help & Support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>
          <div className="border-t border-stone-100" />
          <button className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors group">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-600">Sign Out</span>
            </div>
          </button>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full"
          size="lg"
          isLoading={isSaving}
        >
          Save Changes
        </Button>

        {/* Version info */}
        <p className="text-center text-sm text-stone-400">
          Little Bo Peep v1.0.0
        </p>
      </main>
    </div>
  );
}
