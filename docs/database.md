# ExpiryBox Database Design & Guide

## 1. Schema Overview
ExpiryBox uses a fully normalized MySQL 8.0 schema designed for speed, referential integrity, and complete isolation between users.

### Tables
1. **`users`**:
   - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
   - `name`: VARCHAR(120)
   - `email`: VARCHAR(190) UNIQUE
   - `password_hash`: VARCHAR(255) (BCrypt hash)
   - Timestamps: `created_at`, `updated_at`

2. **`products`**:
   - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
   - `user_id`: BIGINT (Foreign Key to users.id CASCADE)
   - `product_name`: VARCHAR(255)
   - `brand`: VARCHAR(150)
   - `barcode`: VARCHAR(64)
   - `category`: VARCHAR(60) (Dairy, Food, Bakery, Medicine, Skincare, etc.)
   - `package_size`: VARCHAR(80) (e.g., "500 ml", "1 kg")
   - `quantity`: INT UNSIGNED (e.g., 2)
   - `unit`: VARCHAR(40) (e.g., "bottles", "pcs", "boxes")
   - `batch_number`: VARCHAR(100) (Lot/Batch code)
   - `manufacturing_date`: DATE (Nullable)
   - `expiry_date`: DATE (Target expiry date)
   - `expiry_type`: ENUM('expiry', 'use_by', 'best_before', 'unknown')
   - `date_precision`: ENUM('DAY', 'MONTH', 'YEAR')
   - `source`: ENUM('barcode', 'camera', 'uploaded_image', 'manual', 'combined')
   - `notes`: TEXT
   - `status`: ENUM('ACTIVE', 'EXPIRING_SOON', 'EXPIRING_TODAY', 'EXPIRING_TOMORROW', 'EXPIRED', 'CONSUMED', 'DISCARDED', 'REMOVED')
   - `confidence_score`: DECIMAL(4,3)
   - Timestamps: `created_at`, `updated_at`
   - Indexes: `(user_id, status)`, `(user_id, expiry_date)`, `(expiry_date)`

3. **`product_images`**:
   - `id`, `product_id`, `user_id`
   - `image_type`: ENUM('product', 'barcode', 'expiry_label', 'additional')
   - `file_name`, `file_path`, `mime_type`, `file_size`
   - Files are stored on filesystem at `/uploads/users/{userId}/products/{productId}/`

4. **`notifications`**:
   - `id`, `user_id`, `product_id`, `notification_date`
   - `notification_type`: ENUM('EXPIRING_IN_5_DAYS', ..., 'EXPIRING_TODAY', 'EXPIRED')
   - `message`: VARCHAR(500)
   - `is_read`: TINYINT(1)
   - `sent`: TINYINT(1)
   - Unique Index: `(user_id, product_id, notification_date, notification_type)` prevents duplicate daily reminders.

5. **`notification_settings`**:
   - `id`, `user_id` (UNIQUE)
   - `enabled`, `notification_time`, `expiry_day_enabled`, `post_expiry_enabled`, `remind_days_before`

6. **`audit_logs`**:
   - `id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `created_at`

## 2. Migration & Setup
Run the scripts against your MySQL instance:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
