import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Check,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRequestBrowserNotifications: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRequestBrowserNotifications,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  Expiry Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Automated 5-day daily reminder alerts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {/* Browser Notification Opt-in Prompt (Section 33) */}
          {'Notification' in window && Notification.permission !== 'granted' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <strong>Enable Browser Alerts:</strong>
                <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Receive device alerts when items hit their 5-day expiry window.
                </p>
              </div>
              <button
                onClick={onRequestBrowserNotifications}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
              >
                Enable
              </button>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-sm">No notifications yet.</p>
              <p className="text-xs max-w-xs mx-auto">
                Reminders will automatically arrive as items approach their 5-day expiration window.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUrgent =
                n.notificationType === 'EXPIRING_TODAY' ||
                n.notificationType === 'EXPIRING_TOMORROW' ||
                n.notificationType === 'EXPIRED';

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between ${
                    !n.isRead
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        !n.isRead ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900' : 'bg-transparent'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {n.message}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                        <span className="capitalize">{n.notificationType.replace(/_/g, ' ').toLowerCase()}</span>
                        <span>•</span>
                        <span>{n.notificationDate}</span>
                      </div>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => onMarkAsRead(n.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
