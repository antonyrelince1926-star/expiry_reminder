import React from 'react';
import {
  Clock,
  Plus,
  Bell,
  Sun,
  Moon,
  RotateCcw,
  Database,
  AlertTriangle,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'products' | 'usesoon' | 'settings';
  setCurrentView: (view: 'dashboard' | 'products' | 'usesoon' | 'settings') => void;
  onOpenAdd: () => void;
  onOpenDatabase: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onResetSeed: () => void;
  expiringCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenAdd,
  onOpenDatabase,
  onOpenNotifications,
  unreadCount,
  isDarkMode,
  onToggleTheme,
  onResetSeed,
  expiringCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentView('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Expiry<span className="text-emerald-600 dark:text-emerald-400">Box</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  5-Day Reminders
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Never forget what is about to expire again.
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('products')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'products'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setCurrentView('usesoon')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative flex items-center space-x-1.5 ${
                currentView === 'usesoon'
                  ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Use Soon</span>
              {expiringCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-semibold bg-amber-500 text-white">
                  {expiringCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'settings'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              Settings
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Database Viewer Button (Requirement 4) */}
            <button
              onClick={onOpenDatabase}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              title="View Relational Database Tables"
            >
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">View DB</span>
            </button>

            {/* Primary Action Button: + Add Product */}
            <button
              onClick={onOpenAdd}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              title="Add product manually"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">+ Add Product</span>
              <span className="sm:hidden font-semibold">Add</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

