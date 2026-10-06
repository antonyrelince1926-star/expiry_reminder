import React from 'react';
import { LayoutDashboard, Package, Plus, AlertTriangle, Settings } from 'lucide-react';

interface BottomNavProps {
  currentView: 'dashboard' | 'products' | 'usesoon' | 'settings';
  setCurrentView: (view: 'dashboard' | 'products' | 'usesoon' | 'settings') => void;
  onOpenAdd: () => void;
  expiringCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  setCurrentView,
  onOpenAdd,
  expiringCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center justify-around safe-area-bottom">
      <button
        onClick={() => setCurrentView('dashboard')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-colors ${
          currentView === 'dashboard'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => setCurrentView('products')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-colors ${
          currentView === 'products'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <Package className="w-5 h-5 mb-0.5" />
        <span>Products</span>
      </button>

      {/* Hero Central Add Button */}
      <button
        onClick={onOpenAdd}
        className="flex flex-col items-center justify-center -mt-5 cursor-pointer"
      >
        <div className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 ring-4 ring-white dark:ring-zinc-900 active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 mt-1">Add</span>
      </button>

      <button
        onClick={() => setCurrentView('usesoon')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium relative transition-colors ${
          currentView === 'usesoon'
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <div className="relative">
          <AlertTriangle className="w-5 h-5 mb-0.5 text-amber-500" />
          {expiringCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white">
              {expiringCount}
            </span>
          )}
        </div>
        <span>Use Soon</span>
      </button>

      <button
        onClick={() => setCurrentView('settings')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-colors ${
          currentView === 'settings'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-zinc-500 dark:text-zinc-400'
        }`}
      >
        <Settings className="w-5 h-5 mb-0.5" />
        <span>Settings</span>
      </button>
    </div>
  );
};
