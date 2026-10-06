-- =====================================================================
-- ExpiryBox Database Schema
-- Version: 1.0.0
-- Dialect: MySQL 8.0+
-- Description: Production-ready relational schema for ExpiryBox product
--              freshness, expiry tracking, and 5-day notification schedules.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `expirybox`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `expirybox`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(150) DEFAULT NULL,
  `barcode` VARCHAR(64) DEFAULT NULL,
  `category` VARCHAR(60) NOT NULL DEFAULT 'Other',
  `package_size` VARCHAR(80) DEFAULT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit` VARCHAR(40) DEFAULT 'pcs',
  `batch_number` VARCHAR(100) DEFAULT NULL,
  `manufacturing_date` DATE DEFAULT NULL,
  `expiry_date` DATE NOT NULL,
  `expiry_type` ENUM('expiry', 'use_by', 'best_before', 'unknown') NOT NULL DEFAULT 'expiry',
  `date_precision` ENUM('DAY', 'MONTH', 'YEAR') NOT NULL DEFAULT 'DAY',
  `source` ENUM('barcode', 'camera', 'uploaded_image', 'manual', 'combined') NOT NULL DEFAULT 'manual',
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('ACTIVE', 'EXPIRING_SOON', 'EXPIRING_TODAY', 'EXPIRING_TOMORROW', 'EXPIRED', 'CONSUMED', 'DISCARDED', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
  `confidence_score` DECIMAL(4,3) DEFAULT 1.000,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_user_id` (`user_id`),
  KEY `idx_products_expiry_date` (`expiry_date`),
  KEY `idx_products_user_status` (`user_id`, `status`),
  KEY `idx_products_user_expiry` (`user_id`, `expiry_date`),
  KEY `idx_products_barcode` (`barcode`),
  CONSTRAINT `fk_products_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Product Images Table
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `image_type` ENUM('product', 'barcode', 'expiry_label', 'additional') NOT NULL DEFAULT 'product',
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(80) NOT NULL,
  `file_size` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product` (`product_id`),
  KEY `idx_product_images_user` (`user_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_product_images_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `notification_date` DATE NOT NULL,
  `notification_type` ENUM(
    'EXPIRING_IN_5_DAYS',
    'EXPIRING_IN_4_DAYS',
    'EXPIRING_IN_3_DAYS',
    'EXPIRING_IN_2_DAYS',
    'EXPIRING_TOMORROW',
    'EXPIRING_TODAY',
    'EXPIRED'
  ) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `sent` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_product_notif_unique` (`user_id`, `product_id`, `notification_date`, `notification_type`),
  KEY `idx_notifications_user_unread` (`user_id`, `is_read`),
  KEY `idx_notifications_date` (`notification_date`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Notification Settings Table
CREATE TABLE IF NOT EXISTS `notification_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `notification_time` TIME NOT NULL DEFAULT '08:00:00',
  `expiry_day_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `post_expiry_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `remind_days_before` INT NOT NULL DEFAULT 5,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notification_settings_user` (`user_id`),
  CONSTRAINT `fk_notif_settings_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Sessions Table
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(128) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `last_activity` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expiry` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(60) NOT NULL,
  `entity_type` VARCHAR(60) NOT NULL,
  `entity_id` BIGINT UNSIGNED DEFAULT NULL,
  `description` VARCHAR(500) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user` (`user_id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
