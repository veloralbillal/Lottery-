-- ==========================================================
-- Decoupled Digital Store MySQL Database Schema Blueprint
-- Production Target: veloralb_Digital
-- ==========================================================

-- Create digital_categories
CREATE TABLE IF NOT EXISTS `digital_categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed digital_categories
INSERT INTO `digital_categories` (`id`, `name`, `label`) VALUES
('web-templates', 'web-templates', '🌐 Web Templates'),
('sheets-trackers', 'sheets-trackers', '📊 Excel & Sheets'),
('design-assets', 'design-assets', '🎨 Design Assets'),
('ebooks-guides', 'ebooks-guides', '📚 Ebooks & Guides')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Create digital_products
CREATE TABLE IF NOT EXISTS `digital_products` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `image` VARCHAR(255) NULL,
  `category` VARCHAR(50) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `stars` DECIMAL(2, 1) DEFAULT 5.0,
  `sales` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed digital_products
INSERT INTO `digital_products` (`id`, `title`, `description`, `price`, `image`, `category`, `file_path`, `stars`, `sales`) VALUES
('prod-1', 'Premium Admin Dashboard WordPress Theme', 'A fully premium, high-speed dashboard theme featuring custom charts, responsive widgets, lottery manager modules, and advanced user roles management.', 450.00, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', 'web-templates', 'premium_admin_theme_v2.zip', 4.9, 128),
('prod-2', 'Elite Excel Automated Accounting Ledger', 'Advanced accounting sheet for automated ledger inputs, double-entry tracking, real-time profit and loss calculations, and bKash/Nagad reconciliation.', 180.00, 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80', 'sheets-trackers', 'elite_accounting_ledger_2026.xlsx', 4.8, 342),
('prod-3', 'Digital Agency Canva Templates Pack', '150+ ultra-high fidelity social media templates, posters, promotional banners, and branding materials custom-made for digital agents and recruiters.', 250.00, 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80', 'design-assets', 'agency_canva_templates.pdf', 4.7, 215),
('prod-4', 'PHP 8.3 Advanced bKash & Nagad Payment API Kit', 'The complete, secure integration code package for official bKash tokenized checkout and Nagad merchant APIs. Supports instant auto-credits.', 550.00, 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=400&q=80', 'web-templates', 'bkash_nagad_payment_kit_v1.2.zip', 5.0, 94),
('prod-5', 'Lottery Recruiting Strategy Masterclass Ebook', 'The comprehensive guide on affiliate network recruiting. Strategies used by top recruiters to generate over ৳50,000 monthly commissions.', 120.00, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', 'ebooks-guides', 'recruiting_champion_handbook.pdf', 4.6, 412),
('prod-6', 'Real-time Multi-User Node.js Live Draw Engine', 'Production-ready WebSockets engine for streaming and animative live drawings. High performance, clusterable, and fully secured.', 850.00, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80', 'web-templates', 'nodejs_websocket_draw_engine.zip', 4.9, 47)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Create digital_orders
CREATE TABLE IF NOT EXISTS `digital_orders` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` INT NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `download_token` VARCHAR(255) NOT NULL,
  `download_count` INT NOT NULL DEFAULT 0,
  `max_downloads` INT NOT NULL DEFAULT 5,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create digital_wishlists
CREATE TABLE IF NOT EXISTS `digital_wishlists` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create digital_reviews
CREATE TABLE IF NOT EXISTS `digital_reviews` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create digital_support
CREATE TABLE IF NOT EXISTS `digital_support` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'open',
  `admin_reply` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
