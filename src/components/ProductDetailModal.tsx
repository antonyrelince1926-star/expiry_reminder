import React, { useState } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit,
  Tag,
  Clock,
  Layers,
  Barcode,
  Package,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Product['status']) => void;
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onUpdateStatus,
  onDeleteProduct,
  onEditProduct,
}) => {
  if (!product) return null;

  const isToday = product.daysUntilExpiry === 0 && product.status !== 'CONSUMED' && product.status !== 'DISCARDED';
  const isTomorrow = product.daysUntilExpiry === 1 && product.status !== 'CONSUMED' && product.status !== 'DISCARDED';
  const isWithin5 = product.daysUntilExpiry >= 2 && product.daysUntilExpiry <= 5 && product.status !== 'CONSUMED' && product.status !== 'DISCARDED';
  const isExpired = (product.daysUntilExpiry < 0 || product.status === 'EXPIRED') && product.status !== 'CONSUMED' && product.status !== 'DISCARDED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {product.category}
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Source: {product.source}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Title & Brand */}
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
              {product.productName}
            </h2>
            {product.brand && (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                {product.brand}
              </p>
            )}
          </div>

          {/* Original Captured Image (Section 26) */}
          {product.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-16/9 bg-black">
              <img
                src={product.imageUrl}
                alt="Product packaging label"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* SECTION: EXPIRY (Section 38 Layout) */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                EXPIRY INFORMATION
              </span>
              {isExpired ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  🔴 Expired
                </span>
              ) : isToday ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  🔴 Expires Today!
                </span>
              ) : isTomorrow ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  🟠 Expires Tomorrow!
                </span>
              ) : isWithin5 ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  🟡 {product.daysUntilExpiry} days remaining
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {product.daysUntilExpiry} days remaining
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Expiry Date:</span>
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {product.expiryDate}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Expiry Type:</span>
                <span className="text-sm font-semibold capitalize text-zinc-800 dark:text-zinc-200">
                  {product.expiryType.replace('_', ' ')}
                </span>
              </div>
            </div>

            {product.batchNumber && (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Batch / Lot Number:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
                  {product.batchNumber}
                </span>
              </div>
            )}
          </div>

          {/* SECTION: PRODUCT SPECIFICATIONS */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
              PRODUCT SPECIFICATIONS
            </span>
            <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-300">
              <div>
                <span>Package Size:</span>{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">{product.packageSize}</strong>
              </div>
              <div>
                <span>Current Quantity:</span>{' '}
                <strong className="text-zinc-900 dark:text-zinc-100">{product.quantity} {product.unit}</strong>
              </div>
              {product.barcode && (
                <div className="col-span-2">
                  <span>Barcode (GTIN/UPC):</span>{' '}
                  <code className="font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                    {product.barcode}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {product.notes && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Notes & Instructions:</span>
              <p>{product.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions (Section 38: Mark Consumed, Mark Discarded, Edit, Delete) */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onUpdateStatus(product.id, 'CONSUMED');
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Consumed</span>
            </button>
            <button
              onClick={() => {
                onUpdateStatus(product.id, 'DISCARDED');
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-100 dark:hover:bg-rose-950 text-zinc-700 dark:text-zinc-200 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
            >
              Mark Discarded
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEditProduct(product);
              }}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              title="Edit product"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onDeleteProduct(product.id);
                onClose();
              }}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
              title="Delete product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
