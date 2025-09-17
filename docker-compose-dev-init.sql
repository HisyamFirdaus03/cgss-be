SELECT 'Creating database: cgss__main';
CREATE DATABASE IF NOT EXISTS cgss__main;
GRANT ALL PRIVILEGES ON cgss__main.* TO 'DBuser'@'%';

SELECT 'Creating database: cgss_demo';
CREATE DATABASE IF NOT EXISTS cgss_demo;
GRANT ALL PRIVILEGES ON cgss_demo.* TO 'DBuser'@'%';

SELECT 'Creating database: cgss_mycronsteel';
CREATE DATABASE IF NOT EXISTS cgss_mycronsteel;
GRANT ALL PRIVILEGES ON cgss_mycronsteel.* TO 'DBuser'@'%';

SELECT 'Creating database: cgss_mig';
CREATE DATABASE IF NOT EXISTS cgss_mig;
GRANT ALL PRIVILEGES ON cgss_mig.* TO 'DBuser'@'%';

SELECT 'Creating database: cgss_demofresh';
CREATE DATABASE IF NOT EXISTS cgss_demofresh;
GRANT ALL PRIVILEGES ON cgss_demofresh.* TO 'DBuser'@'%';