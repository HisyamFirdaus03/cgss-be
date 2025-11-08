-- Create CompanyInfo table and insert seed data for MycrOnSteel database
-- Run this: mysql -u DBuser -p cgss_mycronsteel < create-company-info-mycronsteel.sql

CREATE TABLE IF NOT EXISTS CompanyInfo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  features JSON NOT NULL,
  expiredAt DATETIME DEFAULT NULL,
  theme ENUM('blue', 'green') NOT NULL,
  addresses JSON DEFAULT NULL,
  contactInfo JSON DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  status ENUM('active', 'inactive') NOT NULL,
  UNIQUE INDEX idx_name (name),
  UNIQUE INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert seed data for MycrOnSteel
INSERT INTO CompanyInfo (name, slug, features, theme, expiredAt, addresses, contactInfo, metadata, status) VALUES
(
  'mycronsteel',
  'mycronsteel',
  '["plant", "emission"]',
  'blue',
  NULL,
  '["112 Jalan Cempaka, Taman Cempaka, Johor Bahru, Johor, 81100, Malaysia", "Lot 717, Jalan Sungai Rasau, Seksyen 16, 40706 Shah Alam, Selangor, Malaysia", "Lot 53, Persiaran Selangor, Seksyen 15, 40200 Shah Alam, Selangor, Malaysia", "Lot 49, Jalan Utas 15/7, Seksyen 15, 40200 Shah Alam, Selangor, Malaysia", "Lot 10, Persiaran Selangor, Seksyen 15, 40200 Shah Alam, Selangor, Malaysia"]',
  '{"name": "MycrOnSteel Contact", "email": "contact@mycronsteel.com", "contactNo": "+60 12-345-6789"}',
  '{}',
  'active'
);

SELECT 'CompanyInfo table created and seeded successfully for MycrOnSteel!' AS status;
