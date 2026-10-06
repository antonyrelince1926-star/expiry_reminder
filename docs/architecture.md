# ExpiryBox Architecture Overview

## 1. System Vision
ExpiryBox is built upon the core philosophy:
```
SCAN → IDENTIFY → DETECT EXPIRY → REVIEW → SAVE → REMIND
```
*"I scan the product once, and ExpiryBox remembers when it expires for me."*

## 2. Layered Architecture

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                         │
│  - Vanilla HTML5 / CSS3 / JavaScript (No heavy SPA)   │
│  - Browser Camera & MediaDevices Stream API            │
│  - BarcodeDetector API with software fallback          │
│  - Fetch API for zero-reload asynchronous reviews      │
│  - Theme Engine (Light / Dark mode via CSS variables)  │
└─────────────────────────┬──────────────────────────────┘
                          │ HTTP / JSON / Form POST
┌─────────────────────────▼──────────────────────────────┐
│                  FILTER & AUTH LAYER                   │
│  - SecurityHeadersFilter (CSP, XSS, Frame, HSTS)       │
│  - AuthenticationFilter (Protected session guard)      │
│  - CsrfFilter (Anti-CSRF cryptographically signed)     │
└─────────────────────────┬──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│                 CONTROLLER (SERVLET)                   │
│  - LoginServlet / RegisterServlet / LogoutServlet      │
│  - DashboardServlet / ProductListServlet               │
│  - ScanServlet / BarcodeServlet / ExpiryAnalysisServlet│
│  - ProductCreateServlet / ProductDetailsServlet        │
│  - NotificationServlet / NotificationSettingsServlet   │
└─────────────────────────┬──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│                    SERVICE LAYER                       │
│  - AuthenticationService (BCrypt verification)         │
│  - ExpiryEngine (Deterministic 5-day reminder rules)   │
│  - GeminiService (Vision model OCR & date parsing)     │
│  - BarcodeService (Lookup & normalization)             │
│  - DuplicateDetectionService (Batch & expiry matching) │
│  - NotificationService (Deduplicated alerts)           │
└─────────────────────────┬──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│                 DATA ACCESS LAYER (DAO)                │
│  - UserDAO, ProductDAO, ProductImageDAO                │
│  - NotificationDAO, NotificationSettingsDAO            │
│  - AuditLogDAO                                         │
│  - Strict PreparedStatement & Transaction isolation    │
└─────────────────────────┬──────────────────────────────┘
                          │ JDBC Driver (HikariCP)
┌─────────────────────────▼──────────────────────────────┐
│                   PERSISTENCE LAYER                    │
│  - MySQL 8.0+ Relational Database Engine               │
│  - UTF8mb4 encoding, foreign keys, cascade deletes     │
│  - Dedicated indexes on expiry dates and user status   │
└────────────────────────────────────────────────────────┘
```

## 3. Core Business Distinction: Barcode vs Expiry Date
A barcode (UPC-A, EAN-13, GTIN) identifies product metadata (Name, Brand, Category, Packaging Size). It does **NOT** contain the specific expiry date of the individual package.
- **Barcode** → Product Identification.
- **Packaging Vision / Gemini OCR** → Physical Package Expiry Date & Batch Code.
- ExpiryBox always runs both stages independently to ensure absolute accuracy.

## 4. Background Scheduled Processing
A Tomcat `ServletContextListener` initializes a `ScheduledExecutorService` running every hour.
It evaluates all active products where:
`CURDATE() <= expiry_date AND DATEDIFF(expiry_date, CURDATE()) <= 5`
and generates appropriate in-app notifications without requiring the user to open the dashboard.
