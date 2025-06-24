'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface PageCheckSettings {
  autoCheckEnabled: boolean;
  autoCheckFrequency: string;
  autoCheckUserId: string | null;
}

interface PageCheckSettingsData {
  settings: PageCheckSettings;
  adminUsers: User[];
}

export default function PageCheckSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PageCheckSettings>({
    autoCheckEnabled: true,
    autoCheckFrequency: 'weekly',
    autoCheckUserId: null,
  });
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/page-checks');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data: PageCheckSettingsData = await response.json();
      setSettings(data.settings);
      setAdminUsers(data.adminUsers);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load page check settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/page-checks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      toast.success('Page check settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const runScheduledCheck = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/page-checks/scheduled', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to run scheduled check');
      }

      const result = await response.json();
      toast.success(result.message || 'Scheduled check completed successfully');
    } catch (error) {
      console.error('Error running scheduled check:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to run scheduled check');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#3e4050] rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-600 rounded w-1/4"></div>
            <div className="h-10 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#3e4050] rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Automatic Page Check Settings</h2>
      
      <div className="space-y-6">
        {/* Enable/Disable Automatic Checks */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.autoCheckEnabled}
              onChange={(e) => setSettings({ ...settings, autoCheckEnabled: e.target.checked })}
              className="w-4 h-4 text-[#68D08B] bg-[#252831] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
            />
            <span className="text-white font-medium">Enable Automatic Page Checks</span>
          </label>
          <p className="text-[#a7a9b4] text-sm mt-1">
            When enabled, automatic checks will be performed on all casino pages based on the selected frequency.
          </p>
        </div>

        {/* Check Frequency */}
        <div>
          <label className="block text-white font-medium mb-2">Check Frequency</label>
          <select
            value={settings.autoCheckFrequency}
            onChange={(e) => setSettings({ ...settings, autoCheckFrequency: e.target.value })}
            disabled={!settings.autoCheckEnabled}
            className="w-full px-3 py-2 bg-[#252831] border border-[#404055] rounded-lg text-white focus:ring-2 focus:ring-[#68D08B] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="text-[#a7a9b4] text-sm mt-1">
            How often automatic checks should be performed.
          </p>
        </div>

        {/* User Selection */}
        <div>
          <label className="block text-white font-medium mb-2">Check User</label>
          <select
            value={settings.autoCheckUserId || ''}
            onChange={(e) => setSettings({ ...settings, autoCheckUserId: e.target.value || null })}
            disabled={!settings.autoCheckEnabled}
            className="w-full px-3 py-2 bg-[#252831] border border-[#404055] rounded-lg text-white focus:ring-2 focus:ring-[#68D08B] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select an admin user...</option>
            {adminUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
          <p className="text-[#a7a9b4] text-sm mt-1">
            Which admin user should be credited with performing the automatic checks. If none selected, the first available admin will be used.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4 border-t border-[#404055]">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#68D08B] text-white rounded-lg font-medium hover:bg-[#5bc17f] focus:ring-2 focus:ring-[#68D08B] focus:ring-offset-2 focus:ring-offset-[#3e4050] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={runScheduledCheck}
            disabled={saving || !settings.autoCheckEnabled}
            className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 focus:ring-offset-[#3e4050] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Running...' : 'Run Check Now'}
          </button>
        </div>
      </div>
    </div>
  );
} 