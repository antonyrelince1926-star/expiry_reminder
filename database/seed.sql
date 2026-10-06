-- =====================================================================
-- ExpiryBox Seed Data
-- Description: Development demo data satisfying specification section 74
-- =====================================================================

USE `expirybox`;

-- Default Demo User (password is 'Password123!', hashed using BCrypt)
-- Hash generated with standard BCrypt work factor 12:
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `created_at`, `updated_at`)
VALUES (
  1,
  'Demo User',
  'demo@expirybox.local',
  '$2a$12$e80yqVwI3c3BfgLzI7hRweDqYd15aH3XNq1hG1U6.nCpmhXW5i3.C',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Default Notification Settings
INSERT INTO `notification_settings` (`user_id`, `enabled`, `notification_time`, `expiry_day_enabled`, `post_expiry_enabled`, `remind_days_before`)
VALUES (1, 1, '08:00:00', 1, 1, 5)
ON DUPLICATE KEY UPDATE `enabled` = 1;

-- Seed Products matching Specification Section 74:
-- 1. Milk (Expires tomorrow)
INSERT INTO `products` (
  `id`, `user_id`, `product_name`, `brand`, `barcode`, `category`, `package_size`,
  `quantity`, `unit`, `batch_number`, `manufacturing_date`, `expiry_date`,
  `expiry_type`, `date_precision`, `source`, `notes`, `status`, `confidence_score`
) VALUES (
  1, 1, 'Fresh Whole Milk 1L', 'Horizon Organic', '025293600270', 'Dairy', '1 Liter',
  2, 'bottles', 'M-2026-OCT', DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  'use_by', 'DAY', 'barcode', 'Keep refrigerated at 4°C', 'EXPIRING_TOMORROW', 0.980
) ON DUPLICATE KEY UPDATE `product_name` = VALUES(`product_name`);

-- 2. Bread (Expires in 3 days)
INSERT INTO `products` (
  `id`, `user_id`, `product_name`, `brand`, `barcode`, `category`, `package_size`,
  `quantity`, `unit`, `batch_number`, `manufacturing_date`, `expiry_date`,
  `expiry_type`, `date_precision`, `source`, `notes`, `status`, `confidence_score`
) VALUES (
  2, 1, 'Artisan Sourdough Loaf', 'Bakery Fresh', '041220789012', 'Bakery', '500g',
  1, 'loaf', 'B-1092', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY),
  'best_before', 'DAY', 'camera', 'Store in dry bread box', 'EXPIRING_SOON', 0.950
) ON DUPLICATE KEY UPDATE `product_name` = VALUES(`product_name`);

-- 3. Face Cream (Expires in 5 days)
INSERT INTO `products` (
  `id`, `user_id`, `product_name`, `brand`, `barcode`, `category`, `package_size`,
  `quantity`, `unit`, `batch_number`, `manufacturing_date`, `expiry_date`,
  `expiry_type`, `date_precision`, `source`, `notes`, `status`, `confidence_score`
) VALUES (
  3, 1, 'Hydrating Day Cream SPF 30', 'CeraVe', '3606000537452', 'Skincare', '50 ml',
  1, 'jar', 'LOT-9921', DATE_SUB(CURDATE(), INTERVAL 180 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY),
  'expiry', 'DAY', 'combined', 'High sun protection moisturizer', 'EXPIRING_SOON', 0.920
) ON DUPLICATE KEY UPDATE `product_name` = VALUES(`product_name`);

-- 4. Dog Food (Expires in 12 days)
INSERT INTO `products` (
  `id`, `user_id`, `product_name`, `brand`, `barcode`, `category`, `package_size`,
  `quantity`, `unit`, `batch_number`, `manufacturing_date`, `expiry_date`,
  `expiry_type`, `date_precision`, `source`, `notes`, `status`, `confidence_score`
) VALUES (
  4, 1, 'Grain-Free Salmon Dog Food', 'Blue Buffalo', '859610001234', 'Pet Food', '2.5 kg',
  1, 'bag', 'BB-44281', DATE_SUB(CURDATE(), INTERVAL 90 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY),
  'best_before', 'DAY', 'barcode', 'For adult dogs', 'ACTIVE', 0.990
) ON DUPLICATE KEY UPDATE `product_name` = VALUES(`product_name`);

-- 5. Canned Food (Expired yesterday)
INSERT INTO `products` (
  `id`, `user_id`, `product_name`, `brand`, `barcode`, `category`, `package_size`,
  `quantity`, `unit`, `batch_number`, `manufacturing_date`, `expiry_date`,
  `expiry_type`, `date_precision`, `source`, `notes`, `status`, `confidence_score`
) VALUES (
  5, 1, 'Organic Diced Tomatoes', 'Muir Glen', '043000014022', 'Food', '400g',
  1, 'can', 'LOT-7821', DATE_SUB(CURDATE(), INTERVAL 365 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY),
  'best_before', 'DAY', 'manual', 'Expired yesterday - inspect before discarding', 'EXPIRED', 1.000
) ON DUPLICATE KEY UPDATE `product_name` = VALUES(`product_name`);

-- Seed Initial Notifications for Demo User
INSERT INTO `notifications` (`user_id`, `product_id`, `notification_date`, `notification_type`, `message`, `is_read`, `sent`)
VALUES
(1, 1, CURDATE(), 'EXPIRING_TOMORROW', 'Horizon Organic Fresh Whole Milk 1L expires tomorrow!', 0, 1),
(1, 2, CURDATE(), 'EXPIRING_IN_3_DAYS', 'Bakery Fresh Artisan Sourdough Loaf expires in 3 days.', 0, 1),
(1, 3, CURDATE(), 'EXPIRING_IN_5_DAYS', 'CeraVe Hydrating Day Cream SPF 30 expires in 5 days.', 1, 1),
(1, 5, CURDATE(), 'EXPIRED', 'Muir Glen Organic Diced Tomatoes expired yesterday.', 0, 1)
ON DUPLICATE KEY UPDATE `message` = VALUES(`message`);
