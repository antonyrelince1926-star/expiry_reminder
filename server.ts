import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Gemini SDK with telemetry header per skill instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Data Store (Emulating MySQL Relational Persistence for Development)
export interface ProductEntity {
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
  createdAt: string;
  updatedAt: string;
}

export interface NotificationEntity {
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

export interface AuditLogEntity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: string;
}

// Global state
let products: ProductEntity[] = [];
let notifications: NotificationEntity[] = [];
let auditLogs: AuditLogEntity[] = [];
let notificationSettings = {
  enabled: true,
  notificationTime: '08:00',
  expiryDayEnabled: true,
  postExpiryEnabled: true,
  remindDaysBefore: 5,
  customIntervalDays: 10, // e.g. 10, 15, 30 days advance reminder
};

// Seed initial products matching specification section 74
function initSeedData() {
  const today = new Date();
  const format = (d: Date) => d.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);

  const in5Days = new Date(today);
  in5Days.setDate(today.getDate() + 5);

  const in12Days = new Date(today);
  in12Days.setDate(today.getDate() + 12);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  products = [
    {
      id: 'p-1',
      userId: 'usr-1',
      productName: 'Fresh Whole Milk 1L',
      brand: 'Horizon Organic',
      barcode: '025293600270',
      category: 'Dairy',
      packageSize: '1 Liter',
      quantity: 2,
      unit: 'bottles',
      batchNumber: 'M-2026-OCT',
      manufacturingDate: format(new Date(today.getTime() - 6 * 86400000)),
      expiryDate: format(tomorrow),
      expiryType: 'use_by',
      datePrecision: 'DAY',
      source: 'barcode',
      notes: 'Keep chilled at 4°C',
      status: 'EXPIRING_TOMORROW',
      confidenceScore: 0.98,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p-2',
      userId: 'usr-1',
      productName: 'Artisan Sourdough Loaf',
      brand: 'Bakery Fresh',
      barcode: '041220789012',
      category: 'Bakery',
      packageSize: '500g',
      quantity: 1,
      unit: 'loaf',
      batchNumber: 'B-1092',
      manufacturingDate: format(new Date(today.getTime() - 2 * 86400000)),
      expiryDate: format(in3Days),
      expiryType: 'best_before',
      datePrecision: 'DAY',
      source: 'camera',
      notes: 'Store in dry bread box',
      status: 'EXPIRING_SOON',
      confidenceScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p-3',
      userId: 'usr-1',
      productName: 'Hydrating Day Cream SPF 30',
      brand: 'CeraVe',
      barcode: '3606000537452',
      category: 'Skincare',
      packageSize: '50 ml',
      quantity: 1,
      unit: 'jar',
      batchNumber: 'LOT-9921',
      manufacturingDate: '2026-03-15',
      expiryDate: format(in5Days),
      expiryType: 'expiry',
      datePrecision: 'DAY',
      source: 'combined',
      notes: 'High sun protection moisturizer',
      status: 'EXPIRING_SOON',
      confidenceScore: 0.92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p-4',
      userId: 'usr-1',
      productName: 'Grain-Free Salmon Dog Food',
      brand: 'Blue Buffalo',
      barcode: '859610001234',
      category: 'Pet Food',
      packageSize: '2.5 kg',
      quantity: 1,
      unit: 'bag',
      batchNumber: 'BB-44281',
      manufacturingDate: '2026-06-01',
      expiryDate: format(in12Days),
      expiryType: 'best_before',
      datePrecision: 'DAY',
      source: 'barcode',
      notes: 'Complete nutrition for adult dogs',
      status: 'ACTIVE',
      confidenceScore: 0.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p-5',
      userId: 'usr-1',
      productName: 'Organic Diced Tomatoes',
      brand: 'Muir Glen',
      barcode: '043000014022',
      category: 'Food',
      packageSize: '400g',
      quantity: 1,
      unit: 'can',
      batchNumber: 'LOT-7821',
      manufacturingDate: '2025-09-01',
      expiryDate: format(yesterday),
      expiryType: 'best_before',
      datePrecision: 'DAY',
      source: 'manual',
      notes: 'Expired yesterday - inspect before discarding',
      status: 'EXPIRED',
      confidenceScore: 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  notifications = [
    {
      id: 'notif-1',
      userId: 'usr-1',
      productId: 'p-1',
      productName: 'Horizon Organic Fresh Whole Milk 1L',
      notificationDate: format(today),
      notificationType: 'EXPIRING_TOMORROW',
      message: 'Horizon Organic Fresh Whole Milk 1L expires tomorrow!',
      isRead: false,
      sent: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'usr-1',
      productId: 'p-2',
      productName: 'Bakery Fresh Artisan Sourdough Loaf',
      notificationDate: format(today),
      notificationType: 'EXPIRING_IN_3_DAYS',
      message: 'Bakery Fresh Artisan Sourdough Loaf expires in 3 days.',
      isRead: false,
      sent: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-3',
      userId: 'usr-1',
      productId: 'p-3',
      productName: 'CeraVe Hydrating Day Cream SPF 30',
      notificationDate: format(today),
      notificationType: 'EXPIRING_IN_5_DAYS',
      message: 'CeraVe Hydrating Day Cream SPF 30 expires in 5 days.',
      isRead: true,
      sent: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-4',
      userId: 'usr-1',
      productId: 'p-5',
      productName: 'Muir Glen Organic Diced Tomatoes',
      notificationDate: format(today),
      notificationType: 'EXPIRED',
      message: 'Muir Glen Organic Diced Tomatoes expired yesterday.',
      isRead: false,
      sent: true,
      createdAt: new Date().toISOString(),
    },
  ];

  auditLogs = [
    {
      id: 'log-1',
      userId: 'usr-1',
      action: 'SYSTEM_SEED',
      entityType: 'PRODUCTS',
      entityId: 'ALL',
      description: 'Initialized seed data with 5 demonstration products.',
      createdAt: new Date().toISOString(),
    },
  ];
}

initSeedData();

// Deterministic Expiry Calculation Engine
function computeStatusAndDays(expiryDateStr: string): { daysRemaining: number; status: ProductEntity['status']; message: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = expiryDateStr.split('-').map(Number);
  const exp = new Date(parts[0], parts[1] - 1, parts[2]);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let status: ProductEntity['status'] = 'ACTIVE';
  let message = `Expires in ${daysRemaining} days.`;

  if (daysRemaining < 0) {
    status = 'EXPIRED';
    const absDays = Math.abs(daysRemaining);
    message = absDays === 1 ? 'Expired yesterday.' : `Expired ${absDays} days ago.`;
  } else if (daysRemaining === 0) {
    status = 'EXPIRING_TODAY';
    message = 'Expires today!';
  } else if (daysRemaining === 1) {
    status = 'EXPIRING_TOMORROW';
    message = 'Expires tomorrow.';
  } else if (daysRemaining <= 5) {
    status = 'EXPIRING_SOON';
    message = `Expires in ${daysRemaining} days.`;
  }

  return { daysRemaining, status, message };
}

// Background Reminder Generator: Enforces 5-day daily reminders
function runReminderJob() {
  const todayStr = new Date().toISOString().split('T')[0];

  products.forEach((p) => {
    if (p.status === 'CONSUMED' || p.status === 'DISCARDED') return;

    const { daysRemaining, status } = computeStatusAndDays(p.expiryDate);
    p.status = status;

    let notifType: NotificationEntity['notificationType'] | null = null;
    let notifMessage = '';

    if (daysRemaining === 5) {
      notifType = 'EXPIRING_IN_5_DAYS';
      notifMessage = `${p.productName} expires in 5 days.`;
    } else if (daysRemaining === 4) {
      notifType = 'EXPIRING_IN_4_DAYS';
      notifMessage = `${p.productName} expires in 4 days.`;
    } else if (daysRemaining === 3) {
      notifType = 'EXPIRING_IN_3_DAYS';
      notifMessage = `${p.productName} expires in 3 days.`;
    } else if (daysRemaining === 2) {
      notifType = 'EXPIRING_IN_2_DAYS';
      notifMessage = `${p.productName} expires in 2 days.`;
    } else if (daysRemaining === 1) {
      notifType = 'EXPIRING_TOMORROW';
      notifMessage = `${p.productName} expires tomorrow.`;
    } else if (daysRemaining === 0) {
      notifType = 'EXPIRING_TODAY';
      notifMessage = `🔴 ${p.productName} expires today!`;
    } else if (daysRemaining === -1 && notificationSettings.postExpiryEnabled) {
      notifType = 'EXPIRED';
      notifMessage = `${p.productName} expired yesterday.`;
    }

    if (notifType) {
      // Check deduplication (user_id, product_id, notification_date, notification_type)
      const existing = notifications.find(
        (n) => n.userId === p.userId && n.productId === p.id && n.notificationDate === todayStr && n.notificationType === notifType
      );

      if (!existing) {
        notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: p.userId,
          productId: p.id,
          productName: p.productName,
          notificationDate: todayStr,
          notificationType: notifType,
          message: notifMessage,
          isRead: false,
          sent: true,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
}

// ----------------- API ENDPOINTS ----------------- //

// 1. Analyze Packaging Expiry with Gemini 3.8 Flash (Server-Side)
app.post('/api/scan/analyze-expiry', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', barcode = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image base64 data is required.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');

    const systemPrompt = `
You are an expert OCR and product freshness extraction AI for 'ExpiryBox'.
Analyze the product image for expiry and freshness dates.

CRITICAL EXTRACTION RULES:
1. FINDING THE EXPIRY DATE:
   - Search the entire image carefully for expiry stamps, ink-jet prints, dot-matrix dots, laser etchings, or text labels.
   - Look for keywords: 'EXP', 'EXPIRES', 'EXPIRY', 'USE BY', 'BEST BEFORE', 'BB', 'BBE', 'VALID UNTIL'.
   - Also check near the bottle neck, cap, bottom seam, or side flaps where expiration dates are commonly stamped.
2. DISTINGUISHING EXPIRY vs MANUFACTURING:
   - 'EXP', 'USE BY', 'BEST BEFORE' = Expiry Date.
   - 'MFG', 'MANUFACTURED', 'PROD', 'PACKED' = Manufacturing Date (put in manufacturingDate field).
   - If only a manufacturing date is found and you know the standard shelf-life of the product category (e.g. fresh milk = 7 days, bread = 7 days, canned goods = 2 years), you may calculate and suggest the expiryDate, but prioritize explicit expiry stamps.
3. DATE FORMAT NORMALIZATION:
   - Always convert extracted dates to ISO format 'YYYY-MM-DD'.
   - Support DD/MM/YYYY, MM/DD/YYYY, YY-MM-DD, Month YYYY, etc.
   - If date is Month/Year only (e.g. '10/2026'), use the last day of that month ('2026-10-31') and set 'datePrecision': 'MONTH'.
4. PRODUCT & BATCH DETAILS:
   - Extract product name, brand, category (Food, Beverages, Dairy, Bakery, Meat & Seafood, Snacks, Medicine, Cosmetics, Skincare, Pet Food, Household, Cleaning, Personal Care, Other), package size, and batch/lot number (LOT, BATCH, BNO).
5. Return raw JSON matching the requested schema.
`;

    const userPrompt = `Extract expiry date, product details, batch number, and manufacturing date from this product image. Known barcode context: "${barcode}". Return valid JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING, description: "Name of the product extracted from label" },
            brand: { type: Type.STRING, description: "Brand name" },
            barcode: { type: Type.STRING, description: "Barcode if visible" },
            category: { type: Type.STRING, description: "Category of product" },
            packageSize: { type: Type.STRING, description: "Size/volume e.g. 500ml, 1kg" },
            expiryDate: { type: Type.STRING, description: "Expiry or Best Before date in YYYY-MM-DD format" },
            expiryType: { type: Type.STRING, description: "expiry, use_by, or best_before" },
            datePrecision: { type: Type.STRING, description: "DAY, MONTH, or YEAR" },
            batchNumber: { type: Type.STRING, description: "Batch or Lot number" },
            manufacturingDate: { type: Type.STRING, description: "Manufacturing date in YYYY-MM-DD if present" },
            isAmbiguousDate: { type: Type.BOOLEAN, description: "True if date order is ambiguous" },
            ambiguousOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Possible date interpretations"
            },
            notes: { type: Type.STRING, description: "Extra label observations" }
          },
          required: ["productName", "expiryDate"]
        }
      },
    });

    const responseText = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      // If backticks wrap JSON, strip them
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Default fallback dates if not visible
    const today = new Date();
    const defaultExp = new Date(today);
    defaultExp.setDate(today.getDate() + 7);

    const result = {
      productName: parsed.productName || 'Scanned Product',
      brand: parsed.brand || '',
      barcode: parsed.barcode || barcode || '',
      category: parsed.category || 'Food',
      packageSize: parsed.packageSize || '1 unit',
      expiryDate: parsed.expiryDate || defaultExp.toISOString().split('T')[0],
      expiryType: parsed.expiryType || 'expiry',
      datePrecision: parsed.datePrecision || 'DAY',
      batchNumber: parsed.batchNumber || '',
      manufacturingDate: parsed.manufacturingDate || null,
      isAmbiguousDate: !!parsed.isAmbiguousDate,
      ambiguousOptions: Array.isArray(parsed.ambiguousOptions) ? parsed.ambiguousOptions : [],
      confidence: parsed.confidence || {
        productName: 0.9,
        expiryDate: 0.88,
        batchNumber: 0.8,
      },
      notes: parsed.notes || '',
    };

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Gemini vision analysis error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to analyze packaging label.',
    });
  }
});

// 2. Barcode Product Lookup Endpoint
app.post('/api/scan/barcode', async (req: Request, res: Response) => {
  const { barcode } = req.body;
  if (!barcode) {
    return res.status(400).json({ success: false, message: 'Barcode is required.' });
  }

  // 1. Check existing local database
  const existing = products.find((p) => p.barcode === barcode);
  if (existing) {
    return res.json({
      success: true,
      found: true,
      source: 'local_database',
      data: {
        productName: existing.productName,
        brand: existing.brand,
        category: existing.category,
        packageSize: existing.packageSize,
        barcode: existing.barcode,
      },
    });
  }

  // 2. Common barcode catalog matching
  const catalog: Record<string, { productName: string; brand: string; category: string; packageSize: string }> = {
    '025293600270': { productName: 'Fresh Whole Milk 1L', brand: 'Horizon Organic', category: 'Dairy', packageSize: '1 Liter' },
    '041220789012': { productName: 'Artisan Sourdough Loaf', brand: 'Bakery Fresh', category: 'Bakery', packageSize: '500g' },
    '3606000537452': { productName: 'Hydrating Day Cream SPF 30', brand: 'CeraVe', category: 'Skincare', packageSize: '50 ml' },
    '859610001234': { productName: 'Grain-Free Salmon Dog Food', brand: 'Blue Buffalo', category: 'Pet Food', packageSize: '2.5 kg' },
    '043000014022': { productName: 'Organic Diced Tomatoes', brand: 'Muir Glen', category: 'Food', packageSize: '400g' },
    '890103000000': { productName: 'Standard Butter', brand: 'Amul', category: 'Dairy', packageSize: '500g' },
    '5000112637922': { productName: 'Diet Coke Can', brand: 'Coca-Cola', category: 'Beverages', packageSize: '330 ml' },
    '8901491101837': { productName: 'Digestive Biscuits', brand: 'Britannia', category: 'Snacks', packageSize: '250g' },
  };

  if (catalog[barcode]) {
    return res.json({
      success: true,
      found: true,
      source: 'catalog',
      data: { ...catalog[barcode], barcode },
    });
  }

  // 3. Fallback 1: Query Open Food Facts
  try {
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      headers: { 'User-Agent': 'ExpiryBox-App/1.0 (cit.edu.in)' },
    });
    if (offRes.ok) {
      const offData = await offRes.json();
      if (offData.status === 1 && offData.product) {
        const prod = offData.product;
        return res.json({
          success: true,
          found: true,
          source: 'open_food_facts',
          data: {
            productName: prod.product_name || prod.product_name_en || 'Product ' + barcode,
            brand: prod.brands || '',
            category: 'Food',
            packageSize: prod.quantity || '',
            barcode,
          },
        });
      }
    }
  } catch (err) {
    // ignore network lookup failures
  }

  // 4. Fallback 2: Ask Gemini AI to infer product info from barcode
  try {
    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `What consumer packaged product corresponds to barcode "${barcode}"? If unknown, provide a sensible generic product name based on barcode prefix or standard item types. Return JSON with keys: productName, brand, category (Food, Beverages, Dairy, Bakery, Meat & Seafood, Snacks, Medicine, Cosmetics, Skincare, Pet Food, Household, Cleaning, Personal Care, Other), packageSize.`,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(aiRes.text || '{}');
    if (parsed.productName) {
      return res.json({
        success: true,
        found: true,
        source: 'gemini_ai_inference',
        data: {
          productName: parsed.productName,
          brand: parsed.brand || '',
          category: parsed.category || 'Food',
          packageSize: parsed.packageSize || '1 unit',
          barcode,
        },
      });
    }
  } catch (e) {
    // ignore AI inference error
  }

  return res.json({
    success: true,
    found: false,
    message: 'Barcode processed. Please capture label photo or enter name manually.',
    data: { barcode },
  });
});

// 3. Duplicate Detection Service
app.post('/api/products/check-duplicate', (req: Request, res: Response) => {
  const { barcode, productName, batchNumber, expiryDate } = req.body;

  const match = products.find((p) => {
    if (p.status === 'CONSUMED' || p.status === 'DISCARDED') return false;
    if (barcode && p.barcode && barcode === p.barcode) return true;
    if (productName && p.productName.toLowerCase() === productName.toLowerCase() && p.expiryDate === expiryDate) return true;
    return false;
  });

  if (match) {
    return res.json({
      isDuplicate: true,
      message: 'This product may already be tracked.',
      existingProduct: match,
    });
  }

  return res.json({ isDuplicate: false });
});

// 4. Products CRUD
app.get('/api/products', (req: Request, res: Response) => {
  runReminderJob();

  const { status, category, search } = req.query as { status?: string; category?: string; search?: string };

  let list = [...products];

  if (status && status !== 'ALL') {
    if (status === 'WITHIN_5_DAYS') {
      list = list.filter((p) => {
        const { daysRemaining } = computeStatusAndDays(p.expiryDate);
        return daysRemaining >= 0 && daysRemaining <= 5 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
      });
    } else if (status === 'TODAY') {
      list = list.filter((p) => {
        const { daysRemaining } = computeStatusAndDays(p.expiryDate);
        return daysRemaining === 0 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
      });
    } else if (status === 'TOMORROW') {
      list = list.filter((p) => {
        const { daysRemaining } = computeStatusAndDays(p.expiryDate);
        return daysRemaining === 1 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
      });
    } else if (status === 'THIS_WEEK') {
      list = list.filter((p) => {
        const { daysRemaining } = computeStatusAndDays(p.expiryDate);
        return daysRemaining >= 0 && daysRemaining <= 7 && p.status !== 'CONSUMED' && p.status !== 'DISCARDED';
      });
    } else if (status === 'ACTIVE') {
      list = list.filter((p) => p.status === 'ACTIVE');
    } else if (status === 'EXPIRED') {
      list = list.filter((p) => p.status === 'EXPIRED');
    } else if (status === 'CONSUMED') {
      list = list.filter((p) => p.status === 'CONSUMED');
    } else if (status === 'DISCARDED') {
      list = list.filter((p) => p.status === 'DISCARDED');
    }
  }

  if (category && category !== 'ALL') {
    list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.batchNumber.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Sort: earliest expiry first
  list.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  // Attach daysRemaining & displayText
  const enriched = list.map((p) => {
    const calc = computeStatusAndDays(p.expiryDate);
    return {
      ...p,
      daysUntilExpiry: calc.daysRemaining,
      expiryDisplayText: calc.message,
    };
  });

  return res.json({ success: true, count: enriched.length, products: enriched });
});

app.post('/api/products', (req: Request, res: Response) => {
  const p = req.body;
  if (!p.productName || !p.expiryDate) {
    return res.status(400).json({ success: false, message: 'Product name and expiry date are required.' });
  }

  const calc = computeStatusAndDays(p.expiryDate);

  const newProduct: ProductEntity = {
    id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId: 'usr-1',
    productName: p.productName.trim(),
    brand: p.brand ? p.brand.trim() : '',
    barcode: p.barcode ? p.barcode.trim() : '',
    category: p.category || 'Other',
    packageSize: p.packageSize || '1 unit',
    quantity: Math.max(1, parseInt(p.quantity, 10) || 1),
    unit: p.unit || 'pcs',
    batchNumber: p.batchNumber || '',
    manufacturingDate: p.manufacturingDate || null,
    expiryDate: p.expiryDate,
    expiryType: p.expiryType || 'expiry',
    datePrecision: p.datePrecision || 'DAY',
    source: p.source || 'manual',
    notes: p.notes || '',
    status: calc.status,
    confidenceScore: p.confidenceScore || 1.0,
    imageUrl: p.imageUrl || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: 'usr-1',
    action: 'PRODUCT_CREATED',
    entityType: 'PRODUCT',
    entityId: newProduct.id,
    description: `Created tracking for '${newProduct.productName}' expiring on ${newProduct.expiryDate}.`,
    createdAt: new Date().toISOString(),
  });

  runReminderJob();

  return res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const existing = products[idx];
  const update = req.body;
  const calc = computeStatusAndDays(update.expiryDate || existing.expiryDate);

  const updated: ProductEntity = {
    ...existing,
    ...update,
    status: update.status || calc.status,
    updatedAt: new Date().toISOString(),
  };

  products[idx] = updated;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: 'usr-1',
    action: 'PRODUCT_UPDATED',
    entityType: 'PRODUCT',
    entityId: id,
    description: `Updated product '${updated.productName}'.`,
    createdAt: new Date().toISOString(),
  });

  runReminderJob();
  return res.json({ success: true, product: updated });
});

app.post('/api/products/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  product.status = status;
  product.updatedAt = new Date().toISOString();

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: 'usr-1',
    action: `PRODUCT_${status}`,
    entityType: 'PRODUCT',
    entityId: id,
    description: `Marked '${product.productName}' as ${status}.`,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, product });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const removed = products.splice(idx, 1)[0];

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: 'usr-1',
    action: 'PRODUCT_DELETED',
    entityType: 'PRODUCT',
    entityId: id,
    description: `Deleted '${removed.productName}' from tracking.`,
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, message: 'Product deleted.' });
});

// 5. Notifications API
app.get('/api/notifications', (req: Request, res: Response) => {
  runReminderJob();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return res.json({ success: true, unreadCount, notifications });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
  }
  return res.json({ success: true });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  notifications.forEach((n) => (n.isRead = true));
  return res.json({ success: true });
});

// 6. Settings & Audit Logs
app.get('/api/settings', (req: Request, res: Response) => {
  return res.json({ success: true, settings: notificationSettings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  notificationSettings = { ...notificationSettings, ...req.body };
  return res.json({ success: true, settings: notificationSettings });
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  return res.json({ success: true, logs: auditLogs });
});

app.post('/api/seed/reset', (req: Request, res: Response) => {
  initSeedData();
  return res.json({ success: true, message: 'Seed data reset successfully.' });
});

// 7. Mount Vite Middleware for Dev OR Serve Static for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExpiryBox server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
