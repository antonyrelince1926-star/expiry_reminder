import React, { useState } from 'react';
import { X, Plus, Calendar, Package, Tag, Hash } from 'lucide-react';
import { CATEGORIES, Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (productData: any) => Promise<void>;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    barcode: '',
    category: 'Food',
    packageSize: '1 unit',
    quantity: 1,
    unit: 'pcs',
    expiryDate: nextWeek.toISOString().split('T')[0],
    expiryType: 'expiry' as Product['expiryType'],
    batchNumber: '',
    notes: '',
    source: 'manual' as Product['source'],
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.expiryDate) return;

    setSaving(true);
    try {
      await onSaveProduct(formData);
      setSaving(false);
      onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Add Product Manually
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Enter product details and expiry date for 5-day reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Whole Milk 1L"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Brand
              </label>
              <input
                type="text"
                placeholder="e.g. Horizon Organic"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expiry Date & Expiry Type */}
          <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 text-sm font-bold text-emerald-900 dark:text-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                Expiry Type
              </label>
              <select
                value={formData.expiryType}
                onChange={(e) => setFormData({ ...formData, expiryType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              >
                <option value="expiry">Expiry (EXP)</option>
                <option value="use_by">Use By</option>
                <option value="best_before">Best Before</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Batch / Lot Number
              </label>
              <input
                type="text"
                placeholder="e.g. B24091"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Package Size
              </label>
              <input
                type="text"
                placeholder="e.g. 500 ml"
                value={formData.packageSize}
                onChange={(e) => setFormData({ ...formData, packageSize: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Unit
              </label>
              <input
                type="text"
                placeholder="pcs / bottles / boxes"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes & Storage Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Keep refrigerated after opening"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
