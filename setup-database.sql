-- CGSS Backend Database Setup Script
-- Run this script as root user: mysql -u root -p < setup-database.sql

-- Create database user
-- NOTE: Replace 'yourpassword' with your actual password
CREATE USER IF NOT EXISTS 'DBuser'@'localhost' IDENTIFIED BY 'yourpassword';
CREATE USER IF NOT EXISTS 'DBuser'@'%' IDENTIFIED BY 'yourpassword';

-- Create databases
CREATE DATABASE IF NOT EXISTS cgss__main;
CREATE DATABASE IF NOT EXISTS cgss_demo;
CREATE DATABASE IF NOT EXISTS cgss_mycronsteel;
CREATE DATABASE IF NOT EXISTS cgss_mig;
CREATE DATABASE IF NOT EXISTS cgss_demofresh;

-- Grant privileges to DBuser
GRANT ALL PRIVILEGES ON cgss__main.* TO 'DBuser'@'localhost';
GRANT ALL PRIVILEGES ON cgss_demo.* TO 'DBuser'@'localhost';
GRANT ALL PRIVILEGES ON cgss_mycronsteel.* TO 'DBuser'@'localhost';
GRANT ALL PRIVILEGES ON cgss_mig.* TO 'DBuser'@'localhost';
GRANT ALL PRIVILEGES ON cgss_demofresh.* TO 'DBuser'@'localhost';

GRANT ALL PRIVILEGES ON cgss__main.* TO 'DBuser'@'%';
GRANT ALL PRIVILEGES ON cgss_demo.* TO 'DBuser'@'%';
GRANT ALL PRIVILEGES ON cgss_mycronsteel.* TO 'DBuser'@'%';
GRANT ALL PRIVILEGES ON cgss_mig.* TO 'DBuser'@'%';
GRANT ALL PRIVILEGES ON cgss_demofresh.* TO 'DBuser'@'%';

FLUSH PRIVILEGES;

-- Show databases created
SHOW DATABASES LIKE 'cgss%';

-- Show user grants
SHOW GRANTS FOR 'DBuser'@'localhost';
