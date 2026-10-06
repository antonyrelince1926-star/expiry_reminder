export interface Product {
  id: string;
  userId: string;
  productName: string;
  brand: string;
  barcode: string;
  category: string;
  packageSize: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  manufacturingDate?: string | null;
  expiryDate: string; // YYYY-MM-DD
  expiryType: 'expiry' | 'use_by' | 'best_before' | 'unknown';
  datePrecision: 'DAY' | 'MONTH' | 'YEAR';
  source: 'barcode' | 'camera' | 'uploaded_image' | 'manual' | 'combined';
  notes: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRING_TODAY' | 'EXPIRING_TOMORROW' | 'EXPIRED' | 'CONSUMED' | 'DISCARDED';
  confidenceScore: number;
  imageUrl?: string;
  daysUntilExpiry: number;
  expiryDisplayText: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  notificationDate: string;
  notificationType: 'EXPIRING_IN_5_DAYS' | 'EXPIRING_IN_4_DAYS' | 'EXPIRING_IN_3_DAYS' | 'EXPIRING_IN_2_DAYS' | 'EXPIRING_TOMORROW' | 'EXPIRING_TODAY' | 'EXPIRED';
  message: string;
  isRead: boolean;
  sent: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  notificationTime: string;
  expiryDayEnabled: boolean;
  postExpiryEnabled: boolean;
  remindDaysBefore: number;
  customIntervalDays: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: string;
}

export interface GeminiExtractedData {
  productName: string;
  brand: string;
  barcode: string;
  category: string;
  packageSize: string;
  expiryDate: string;
  expiryType: 'expiry' | 'use_by' | 'best_before' | 'unknown';
  datePrecision: 'DAY' | 'MONTH' | 'YEAR';
  batchNumber: string;
  manufacturingDate?: string | null;
  isAmbiguousDate: boolean;
  ambiguousOptions: string[];
  confidence: {
    productName: number;
    expiryDate: number;
    batchNumber: number;
  };
  notes: string;
}

export const CATEGORIES = [
  'Food',
  'Beverages',
  'Dairy',
  'Meat & Seafood',
  'Bakery',
  'Snacks',
  'Medicine',
  'Cosmetics',
  'Skincare',
  'Pet Food',
  'Household',
  'Cleaning',
  'Personal Care',
  'Other',
] as const;
