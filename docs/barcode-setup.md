# Barcode Scanning & Product Identification Guide

## 1. Barcode Philosophy
A barcode encodes product identity, not physical batch expiry dates:
```
[Barcode Scan]  ──> [Product Name, Brand, Category, Size]
[Camera Image]  ──> [Physical Package Expiry Date & Batch Code]
```

## 2. Browser Camera & Barcode Detection
ExpiryBox leverages standard browser APIs without intrusive overhead:
- **`navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`** for camera streaming.
- **`window.BarcodeDetector`** (standard Web API) for zero-dependency native barcode scanning when available. Supported formats:
  - `ean_13`, `ean_8`, `upc_a`, `upc_e`, `code_128`, `qr_code`.
- **Canvas snapshot fallback** for desktop/browsers lacking native detector, sending frame to the backend barcode lookup service.

## 3. Product Identification Providers
When a barcode is detected, `ProductIdentificationService` queries:
1. Local MySQL database for previously identified products.
2. Global open product databases (e.g. Open Food Facts).
3. Gemini visual product fallback if barcode is unlisted or absent.
4. Clean manual override allowing instantaneous user input.
