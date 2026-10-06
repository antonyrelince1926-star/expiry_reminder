# ExpiryBox

> **"Never forget what is about to expire again."**

ExpiryBox is a zero-effort product expiry, best-before, freshness, and reminder tracking web application.

---

## 1. Problem Statement
Billions of dollars of food, medicines, and household products are thrown away each year simply because people lose track of what is sitting in their fridge, pantry, or medicine cabinet. Entering expiry dates manually into spreadsheets or complicated inventory systems takes too much effort, causing people to abandon them within days.

ExpiryBox solves this with a **zero-effort workflow**:
```
SCAN → IDENTIFY → DETECT EXPIRY → REVIEW → SAVE → REMIND
```
*"I scan the product once, and ExpiryBox remembers when it expires for me."*

---

## 2. Core Business Rule: Barcode vs. Expiry Date
A barcode identifies the *product identity* (Name, Brand, Category, Packaging Size). It does **NOT** contain the physical expiry date of the individual package!
- **Barcode Scan** → Identifies product metadata.
- **Camera Image / Gemini Vision OCR** → Detects the actual package-specific expiry date, USE BY label, and Batch/Lot code.
- **ExpiryEngine** → Deterministically calculates the 5-day reminder milestones.

---

## 3. Key Features
- **Effortless Scanning**: Instant barcode recognition via browser Camera & BarcodeDetector API.
- **Packaging Expiry OCR**: Server-side Gemini 3.8 Flash model extracts printed dates (`EXP`, `USE BY`, `BEST BEFORE`, `MFG`, `PACKED`) and distinguishes manufacturing from expiration dates.
- **5-Day Reminder Engine**: Automatic daily notifications triggered at:
  - 5 days remaining
  - 4 days remaining
  - 3 days remaining
  - 2 days remaining
  - Tomorrow
  - Today (🔴 Urgent)
  - Expired (Yesterday)
- **Batch-Aware Tracking**: Same product with different batch numbers and expiry dates tracked cleanly as distinct records.
- **Duplicate Detection**: Warns if a matching barcode, batch, or expiry already exists.
- **"Use Soon" Priority View**: One-tap access to items requiring immediate attention.
- **Search & Filter**: Search by name, brand, barcode, batch, or category with instant filtering.
- **Dark & Light Mode**: Accessible, clean design inspired by Linear & Google Material.
- **Audit Logs**: Secure tracking of product creation, consumption, disposal, and edits.

---

## 4. Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Fetch API, Camera API, BarcodeDetector API.
- **Backend**: Java 17+, Jakarta Servlets 6.0, JSP, JDBC, Apache Tomcat 10.1+.
- **Database**: MySQL 8.0+ relational database with foreign keys and unique compound reminder indexes.
- **AI Vision**: Google Gemini 3.8 Flash via server-side `@google/genai` SDK.
- **Security**: BCrypt password hashing, HttpOnly session cookies, CSRF protection, and IDOR validation.

---

## 5. Prerequisites
- Java JDK 17 or higher
- Apache Maven 3.8+
- Apache Tomcat 10.1+
- MySQL Server 8.0+
- Gemini API Key

---

## 6. Installation & Database Setup
1. Clone the repository and configure MySQL:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

2. Configure environment variables in `.env` or `bin/setenv.sh`:
   ```bash
   export DB_URL="jdbc:mysql://localhost:3306/expirybox?useSSL=false&serverTimezone=UTC"
   export DB_USERNAME="root"
   export DB_PASSWORD="your_password"
   export GEMINI_API_KEY="your_gemini_api_key"
   ```

3. Build the WAR package:
   ```bash
   mvn clean package
   ```

4. Deploy to Apache Tomcat:
   ```bash
   cp target/ExpiryBox.war $CATALINA_HOME/webapps/ROOT.war
   $CATALINA_HOME/bin/startup.sh
   ```

---

## 7. Project Directory Structure
```
ExpiryBox/
├── database/
│   ├── schema.sql           # MySQL database schema definition
│   └── seed.sql             # Demo development seed data
├── docs/
│   ├── architecture.md      # Layered architecture overview
│   ├── database.md          # Data dictionary & indexes
│   ├── gemini-setup.md      # Gemini API prompt & configuration
│   ├── barcode-setup.md     # Barcode detector & catalog service
│   ├── notifications.md     # 5-day reminder engine & scheduler
│   ├── security.md          # CSRF, XSS, IDOR & BCrypt documentation
│   ├── deployment.md        # Tomcat WAR deployment instructions
│   └── testing.md           # JUnit 5 & security test matrix
├── src/
│   ├── main/
│   │   ├── java/com/expirybox/
│   │   │   ├── controller/  # Jakarta Servlets
│   │   │   ├── dao/         # JDBC Data Access Objects
│   │   │   ├── model/       # Domain Entities
│   │   │   ├── service/     # ExpiryEngine, GeminiService, etc.
│   │   │   ├── filter/      # Authentication & Security filters
│   │   │   └── util/        # DatabaseConnection, PasswordUtil
│   │   └── webapp/
│   │       ├── WEB-INF/
│   │       │   ├── web.xml  # Servlet mapping and error pages
│   │       │   └── views/   # JSP views
│   └── ...
├── pom.xml                  # Maven Project Object Model
└── README.md
```

---

## 8. License & Privacy
ExpiryBox treats all user product images as private. Images are stored securely and never transmitted to third-party ad networks or analytics platforms.
