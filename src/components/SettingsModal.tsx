import React, { useState, useEffect } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Bell,
  Sun,
  Moon,
  Clock,
  Shield,
  RotateCcw,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { NotificationSettings, AuditLog } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onResetSeed: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
  onResetSeed,
}) => {
  if (!isOpen) return null;

  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    notificationTime: '08:00',
    expiryDayEnabled: true,
    postExpiryEnabled: true,
    remindDaysBefore: 5,
    customIntervalDays: 10,
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);

    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setAuditLogs(data.logs);
      })
      .catch(console.error);
  }, [isOpen]);

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                ExpiryBox Settings
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Reminder preferences & system configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Appearance Section (Section 66) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Appearance
            </h3>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Dark Mode
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isDarkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                  </span>
                </div>
              </div>
              <button
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold text-xs text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                Switch to {isDarkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Section 65: Notification Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              5-Day Reminder Engine Configuration
            </h3>

            <div className="space-y-2">
              {/* Enabled Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Automated Notifications
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Send daily alerts during the 5-day expiry window
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              {/* Custom Advance Reminder Interval */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Custom Advance Reminder Interval
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Notify once X days before expiry (e.g. 10, 15, or 30 days)
                  </span>
                </div>
                <select
                  value={settings.customIntervalDays || 10}
                  onChange={(e) => setSettings({ ...settings, customIntervalDays: parseInt(e.target.value, 10) || 10 })}
                  className="px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-xs"
                >
                  <option value={7}>7 days before</option>
                  <option value={10}>10 days before</option>
                  <option value={15}>15 days before</option>
                  <option value={30}>30 days before</option>
                  <option value={60}>60 days before</option>
                </select>
              </div>

              {/* Mandatory Notice */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                ⭐ <strong>Mandatory 5-Day Window:</strong> Daily reminders during the final 5 days before expiry (5, 4, 3, 2, 1, and expiry day) are permanently enabled for ultimate food & product safety.
              </div>

              {/* Expiry Day Reminder */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Expiry-Day Urgent Alert
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Send high-priority warning on the exact expiry day
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.expiryDayEnabled}
                  onChange={(e) => setSettings({ ...settings, expiryDayEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              {/* Post-Expiry Reminder */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 cursor-pointer">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Post-Expiry Followup
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Alert if an item expired yesterday to prompt disposal
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.postExpiryEnabled}
                  onChange={(e) => setSettings({ ...settings, postExpiryEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings Saved!</span>
                </>
              ) : (
                <span>Save Notification Settings</span>
              )}
            </button>
          </div>

          {/* Section 74: Seed Data & Testing Reset */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Demo Data & System Reset
            </h3>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Reload Section 74 Demo Products
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Milk (tomorrow), Bread (3d), Cream (5d), Dog Food (12d), Tomatoes (expired)
                </span>
              </div>
              <button
                onClick={() => {
                  onResetSeed();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Reset Demo
              </button>
            </div>
          </div>

          {/* Section 78: Audit Logs Viewer */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Audit Trail ({auditLogs.length} events)
              </h3>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {showLogs ? 'Hide Logs' : 'View Audit Logs'}
              </button>
            </div>

            {showLogs && (
              <div className="p-3 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5 border border-zinc-800">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border-b border-zinc-800/80 pb-1">
                    <span className="text-emerald-400 font-bold">[{log.action}]</span>{' '}
                    <span className="text-zinc-400">{log.description}</span>
                    <span className="text-zinc-600 block text-[9px]">{log.createdAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
