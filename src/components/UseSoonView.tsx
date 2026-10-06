import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, Trash2, Calendar, Package } from 'lucide-react';
import { Product } from '../types';

interface UseSoonViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onUpdateStatus: (id: string, status: Product['status']) => void;
  onOpenAdd: () => void;
}

export const UseSoonView: React.FC<UseSoonViewProps> = ({
  products,
  onSelectProduct,
  onUpdateStatus,
  onOpenAdd,
}) => {
  // Section 36: Show products expiring within five days (days <= 5 and not consumed/discarded)
  const useSoonList = products
    .filter(
      (p) =>
        p.status !== 'CONSUMED' &&
        p.status !== 'DISCARDED' &&
        p.daysUntilExpiry <= 5
    )
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              USE SOON — 5-DAY CRITICAL WINDOW
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm mt-1">
              These items are expiring within 5 days or have already reached their expiry date. Prioritize using these in your cooking and meal plans to prevent waste.
            </p>
          </div>
        </div>
      </div>

      {useSoonList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            All clear! Nothing expiring in the next 5 days.
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto">
            Your tracked food, cosmetics, and medicine are all safely within their shelf life.
          </p>
          <button
            onClick={onOpenAdd}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <span>+ Add Another Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useSoonList.map((product) => {
            const isToday = product.daysUntilExpiry === 0;
            const isTomorrow = product.daysUntilExpiry === 1;
            const isPast = product.daysUntilExpiry < 0;

            let badgeBg = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
            let badgeText = `🟡 ${product.daysUntilExpiry} days remaining`;

            if (isPast) {
              badgeBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
              badgeText = `🔴 Past expiry (${Math.abs(product.daysUntilExpiry)}d ago)`;
            } else if (isToday) {
              badgeBg = 'bg-rose-600 text-white border-rose-700 animate-pulse';
              badgeText = '🔴 EXPIRES TODAY';
            } else if (isTomorrow) {
              badgeBg = 'bg-orange-500 text-white border-orange-600';
              badgeText = '🟠 EXPIRES TOMORROW';
            }

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeBg}`}
                    >
                      {badgeText}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
                    {product.productName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    {product.brand && <span>Brand: <strong className="text-zinc-700 dark:text-zinc-300">{product.brand}</strong></span>}
                    <span>Quantity: <strong className="text-zinc-700 dark:text-zinc-300">{product.quantity} {product.unit}</strong></span>
                    {product.packageSize && <span>Size: <strong className="text-zinc-700 dark:text-zinc-300">{product.packageSize}</strong></span>}
                    {product.batchNumber && <span>Batch: <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">{product.batchNumber}</code></span>}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Expires: <strong className="text-zinc-800 dark:text-zinc-200">{product.expiryDate}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(product.id, 'CONSUMED');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Used / Consumed</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(product.id, 'DISCARDED');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 text-xs font-medium transition-colors"
                      title="Mark as discarded"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
