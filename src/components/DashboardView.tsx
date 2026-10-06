import React from 'react';
import {
  Plus,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Product } from '../types';

interface DashboardViewProps {
  products: Product[];
  onOpenAdd: () => void;
  onSelectProduct: (product: Product) => void;
  onUpdateStatus: (id: string, status: Product['status']) => void;
  onViewAllProducts: () => void;
  onViewUseSoon: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  onOpenAdd,
  onSelectProduct,
  onUpdateStatus,
  onViewAllProducts,
  onViewUseSoon,
}) => {
  // Filter active products
  const activeProducts = products.filter(
    (p) => p.status !== 'CONSUMED' && p.status !== 'DISCARDED'
  );

  const expiringToday = activeProducts.filter((p) => p.daysUntilExpiry === 0);
  const expiringTomorrow = activeProducts.filter((p) => p.daysUntilExpiry === 1);
  const expiringWithin5Days = activeProducts.filter(
    (p) => p.daysUntilExpiry >= 2 && p.daysUntilExpiry <= 5
  );
  const expiredProducts = activeProducts.filter((p) => p.daysUntilExpiry < 0);
  const expiringThisWeek = activeProducts.filter(
    (p) => p.daysUntilExpiry >= 0 && p.daysUntilExpiry <= 7
  );
  const consumedProducts = products.filter((p) => p.status === 'CONSUMED');

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome & Quick Action Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Effort Freshness Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good afternoon 👋
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              ExpiryBox is actively watching your items. Receive automated reminders during the final 5 days before anything expires.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenAdd}
              className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>+ Add Product</span>
            </button>
            <button
              onClick={onViewUseSoon}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-sm border border-white/10 transition-colors cursor-pointer"
            >
              <span>Use Soon List</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tracked Products</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {activeProducts.length}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Currently in pantry & fridge</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Expiring This Week</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {expiringThisWeek.length}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Urgent attention recommended</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Past Expiry</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
            {expiredProducts.length}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Check safety before eating</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Consumed</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {consumedProducts.length}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Safely used in time</p>
        </div>
      </div>

      {/* Priority Expiry Alerts Section */}
      {(expiringToday.length > 0 || expiringTomorrow.length > 0 || expiringWithin5Days.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                EXPIRING SOON (5-DAY WINDOW)
              </h2>
            </div>
            <button
              onClick={onViewUseSoon}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>View all ({expiringThisWeek.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Expiring Today Cards */}
            {expiringToday.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group relative bg-rose-50/70 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white mb-2 shadow-xs">
                      🔴 EXPIRES TODAY
                    </span>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400">
                      {product.productName}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {product.brand ? `${product.brand} • ` : ''}{product.packageSize}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    0d
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs">
                  <span className="text-rose-700 dark:text-rose-300 font-medium">
                    Consume immediately
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(product.id, 'CONSUMED');
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 font-medium shadow-2xs border border-zinc-200 dark:border-zinc-700"
                    >
                      Consumed
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Expiring Tomorrow Cards */}
            {expiringTomorrow.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group relative bg-amber-50/70 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white mb-2 shadow-xs">
                      🟠 EXPIRES TOMORROW
                    </span>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {product.productName}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {product.brand ? `${product.brand} • ` : ''}{product.packageSize}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    1d
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
                  <span className="text-amber-800 dark:text-amber-300 font-medium">
                    1 day remaining
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(product.id, 'CONSUMED');
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 font-medium shadow-2xs border border-zinc-200 dark:border-zinc-700"
                    >
                      Consumed
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Expiring in 2-5 Days */}
            {expiringWithin5Days.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 mb-2">
                      🟡 {product.daysUntilExpiry} DAYS LEFT
                    </span>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {product.productName}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {product.brand ? `${product.brand} • ` : ''}{product.packageSize}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    {product.daysUntilExpiry}d
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Expiry: {product.expiryDate}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(product.id, 'CONSUMED');
                    }}
                    className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 font-medium"
                  >
                    Consumed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Added Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Recently Added Products
          </h2>
          <button
            onClick={onViewAllProducts}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>View All ({products.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {p.category}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Qty: {p.quantity} {p.unit}
                  </span>
                </div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {p.productName}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {p.brand || 'No brand specified'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-zinc-600 dark:text-zinc-300">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{p.expiryDate}</span>
                </div>
                <span
                  className={`font-semibold ${
                    p.daysUntilExpiry <= 1
                      ? 'text-rose-600 dark:text-rose-400'
                      : p.daysUntilExpiry <= 5
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {p.expiryDisplayText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
