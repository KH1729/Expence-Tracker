-- Expense tracker: initial expenses table (MySQL 8+)
-- Safe to re-run in dev: uses IF NOT EXISTS

CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(512) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(128) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)),
  updated_at DATETIME(3) NOT NULL DEFAULT (UTC_TIMESTAMP(3)) ON UPDATE UTC_TIMESTAMP(3),
  INDEX idx_expenses_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
