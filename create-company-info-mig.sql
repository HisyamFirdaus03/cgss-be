-- Create CompanyInfo table and insert seed data for MIG database
-- Run this: mysql -u DBuser -p cgss_mig < create-company-info-mig.sql

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

-- Insert seed data for MIG
INSERT INTO CompanyInfo (name, slug, features, theme, expiredAt, addresses, contactInfo, metadata, status) VALUES
(
  'MIG',
  'mig',
  '["emission"]',
  'blue',
  NULL,
  '["MIGB Head Office - 15th Floor, No. 566, Jalan Ipoh, 51200 WP KL.", "3BO Rawang Factory - No. 23, Jalan Cempaka Utama, Taman Anugerah Suria, 48200 Serendah, Selangor.", "3BT Processing Centre - No. 1, Jalan BCU 3, Kawasan Perindustrian Batu Caves Utara, 68100 Batu Caves, Selangor.", "MSM Shah Alam - Lot 717, Jalan Sg. Rasau, Seksyen 16, 40200 Shah Alam, Selangor", "3Bumi (Cambodia) Co. Ltd - Alamin Minimart Outlets, National Road 5, House#B1, Sangkat Chrang Chamres I, Khan Russey Keo, Phnom Penh City, Cambodia"]',
  '{"name": "MIG Contact", "email": "contact@mig.com", "contactNo": "+60 12-345-6789"}',
  '{}',
  'active'
);

SELECT 'CompanyInfo table created and seeded successfully for MIG!' AS status;
