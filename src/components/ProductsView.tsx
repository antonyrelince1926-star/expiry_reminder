import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { Product, CATEGORIES } from '../types';

interface ProductsViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenAdd: () => void;
  onUpdateStatus: (id: string, status: Product['status']) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onSelectProduct,
  onOpenAdd,
  onUpdateStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Filter products locally for instantaneous responsiveness
  const filteredProducts = products.filter((p) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.productName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.batchNumber.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (categoryFilter !== 'ALL' && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }

    // Status Filter
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'TODAY') return p.daysUntilExpiry === 0 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
    if (statusFilter === 'TOMORROW') return p.daysUntilExpiry === 1 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
    if (statusFilter === 'WITHIN_5_DAYS') return p.daysUntilExpiry >= 0 && p.daysUntilExpiry <= 5 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
    if (statusFilter === 'THIS_WEEK') return p.daysUntilExpiry >= 0 && p.daysUntilExpiry <= 7 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
    if (statusFilter === 'ACTIVE') return p.status === 'ACTIVE' || (p.status === 'EXPIRING_SOON' && p.daysUntilExpiry > 1);
    if (statusFilter === 'EXPIRED') return p.status === 'EXPIRED' || p.daysUntilExpiry < 0;
    if (statusFilter === 'CONSUMED') return p.status === 'CONSUMED';
    if (statusFilter === 'DISCARDED') return p.status === 'DISCARDED';

    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            All Products & Pantry
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {filteredProducts.length} of {products.length} tracked items.
          </p>
        </div>

        <button
          onClick={onOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Interactive Search Bar (Section 70) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name, brand, barcode, batch number, or category..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status Filter Chips (Section 40) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'All' },
          { id: 'TODAY', label: 'Today (🔴)' },
          { id: 'TOMORROW', label: 'Tomorrow (🟠)' },
          { id: 'WITHIN_5_DAYS', label: 'Within 5 Days (🟡)' },
          { id: 'THIS_WEEK', label: 'This Week' },
          { id: 'ACTIVE', label: 'Active' },
          { id: 'EXPIRED', label: 'Expired' },
          { id: 'CONSUMED', label: 'Consumed' },
          { id: 'DISCARDED', label: 'Discarded' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setStatusFilter(chip.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === chip.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Category Filter Chips (Section 41) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            categoryFilter === 'ALL'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold'
              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            No products match your current search and filter criteria.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isToday = p.daysUntilExpiry === 0 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
            const isTomorrow = p.daysUntilExpiry === 1 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
            const isWithin5 = p.daysUntilExpiry >= 2 && p.daysUntilExpiry <= 5 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
            const isPast = (p.daysUntilExpiry < 0 || p.status === 'EXPIRED') && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
            const isConsumed = p.status === 'CONSUMED';
            const isDiscarded = p.status === 'DISCARDED';

            let statusBadge = (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Active ({p.daysUntilExpiry}d left)
              </span>
            );

            if (isConsumed) {
              statusBadge = (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  ✓ Consumed
                </span>
              );
            } else if (isDiscarded) {
              statusBadge = (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
                  Discarded
                </span>
              );
            } else if (isPast) {
              statusBadge = (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  🔴 Expired
                </span>
              );
            } else if (isToday) {
              statusBadge = (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  🔴 Today!
                </span>
              );
            } else if (isTomorrow) {
              statusBadge = (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  🟠 Tomorrow!
                </span>
              );
            } else if (isWithin5) {
              statusBadge = (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  🟡 {p.daysUntilExpiry}d left
                </span>
              );
            }

            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      {p.category}
                    </span>
                    {statusBadge}
                  </div>

                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base truncate mb-0.5">
                    {p.productName}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {p.brand ? `${p.brand} • ` : ''}{p.packageSize || '1 unit'}
                  </p>

                  {/* Batch aware indicator (Section 43) */}
                  <div className="flex items-center space-x-2 mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                    {p.batchNumber ? (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
                        <span>Batch:</span>
                        <strong className="text-zinc-700 dark:text-zinc-300">{p.batchNumber}</strong>
                      </span>
                    ) : (
                      <span>No batch recorded</span>
                    )}
                    <span>•</span>
                    <span>Qty: {p.quantity} {p.unit}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-zinc-600 dark:text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-medium">{p.expiryDate}</span>
                  </div>

                  {!isConsumed && !isDiscarded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(p.id, 'CONSUMED');
                      }}
                      className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 text-zinc-600 dark:text-zinc-400 font-medium transition-colors"
                    >
                      Use
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
