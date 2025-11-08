-- Create CompanyInfo table and insert seed data
-- Run this for each database: mysql -u DBuser -p cgss_demo < create-company-info.sql

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

-- Insert seed data
INSERT INTO CompanyInfo (name, slug, features, theme, expiredAt, addresses, contactInfo, metadata, status) VALUES
(
  'demo',
  'demo',
  '["plant", "emission"]',
  'blue',
  NULL,
  '["123 Jalan Melati, Taman Perindustrian, Shah Alam, Selangor, 40000, Malaysia", "456 Jalan Pahlawan, Kampung Baru, Kuala Lumpur, Wilayah Persekutuan, 50480, Malaysia", "789 Jalan Sempurna, Taman Sri Gombak, Gombak, Selangor, 68100, Malaysia", "321 Jalan Bunga, Taman Bunga Raya, Ipoh, Perak, 31400, Malaysia", "654 Jalan Merdeka, Taman Merdeka, Melaka, Melaka, 75000, Malaysia"]',
  '{"name": "Dr Afiq", "email": "afiqzubirchess@gmail.com", "contactNo": "+60 12-245 1581"}',
  '{}',
  'active'
);

SELECT 'CompanyInfo table created and seeded successfully!' AS status;
