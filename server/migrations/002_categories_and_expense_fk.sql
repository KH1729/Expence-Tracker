-- Expense tracker: categories table + expenses.category_id FK
-- Apply once after 001_create_expenses.sql. Requires existing `expenses` with `category` column.

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, created_at, updated_at)
SELECT DISTINCT TRIM(category), CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM expenses
WHERE TRIM(category) <> '';

ALTER TABLE expenses ADD COLUMN category_id BIGINT UNSIGNED NULL AFTER amount;

UPDATE expenses e
INNER JOIN categories c ON TRIM(e.category) = c.name
SET e.category_id = c.id;

INSERT INTO categories (name, created_at, updated_at)
SELECT 'Uncategorized', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE EXISTS (SELECT 1 FROM expenses WHERE category_id IS NULL LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Uncategorized' LIMIT 1);

UPDATE expenses e
INNER JOIN categories c ON c.name = 'Uncategorized'
SET e.category_id = c.id
WHERE e.category_id IS NULL;

ALTER TABLE expenses MODIFY category_id BIGINT UNSIGNED NOT NULL;

ALTER TABLE expenses
  ADD CONSTRAINT fk_expenses_category
  FOREIGN KEY (category_id) REFERENCES categories (id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE expenses DROP INDEX idx_expenses_category;

ALTER TABLE expenses DROP COLUMN category;
