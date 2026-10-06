import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, Tag, Package, Barcode } from 'lucide-react';
import { Product, CATEGORIES } from '../types';

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onUpdateProduct: (id: string, updatedData: Partial<Product>) => Promise<void>;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  onClose,
  onUpdateProduct,
}) => {
  if (!product) return null;

  const [formData, setFormData] = useState({
    productName: product.productName,
    brand: product.brand || '',
    barcode: product.barcode || '',
    category: product.category || 'Food',
    packageSize: product.packageSize || '1 unit',
    quantity: product.quantity,
    unit: product.unit || 'pcs',
    expiryDate: product.expiryDate,
    expiryType: product.expiryType,
    batchNumber: product.batchNumber || '',
    notes: product.notes || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateProduct(product.id, formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
            Edit Product Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Barcode
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
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
                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-900 text-sm"
              >
                <option value="expiry">Expiry (EXP)</option>
                <option value="use_by">Use By</option>
                <option value="best_before">Best Before (BB)</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Batch / Lot #
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Package Size
              </label>
              <input
                type="text"
                value={formData.packageSize}
                onChange={(e) => setFormData({ ...formData, packageSize: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
