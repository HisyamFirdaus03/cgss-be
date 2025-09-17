DEBUG=loopback:connector* pn start:watch
npx pm2 deploy ecosystem.config.cjs production --force
export TZ=UTC; pn start:watch

```
var exec = require('child_process').exec;
var child = exec(' mysqldump -u root -p[root_password] [database_name] > dumpfilename.sql');
var exec = require('child_process').exec(' mysqldump -u root -p dbname > fileName.sql');
```

## Efforts to make emission factor SQL
```sql
CREATE TABLE EmissionFactor
(
    id    INT AUTO_INCREMENT PRIMARY KEY,
    year  INT NOT NULL,
    INDEX idx_year (year) -- Index on year for faster lookups
);

CREATE TABLE WasteGenerated
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    material VARCHAR(255) NOT NULL,
    UNIQUE INDEX idx_material (material) -- Ensures unique materials for quick searches
);

CREATE TABLE WasteGeneratedData
(
    id                         INT AUTO_INCREMENT PRIMARY KEY,
    recycled                   DECIMAL(10, 4) DEFAULT 0,
    landfilled                 DECIMAL(10, 4) DEFAULT 0,
    combusted                  DECIMAL(10, 4) DEFAULT 0,
    composted                  DECIMAL(10, 4) DEFAULT 0,
    anaerobically_digested_dry DECIMAL(10, 4) DEFAULT 0,
    anaerobically_digested_wet DECIMAL(10, 4) DEFAULT 0,

    wasteGeneratedId           INT NOT NULL,
    emissionFactorId           INT NOT NULL,

    FOREIGN KEY (emissionFactorId) REFERENCES EmissionFactor (id),
    FOREIGN KEY (wasteGeneratedId) REFERENCES WasteGenerated (id),

    INDEX                      idx_wasteGeneratedId (wasteGeneratedId), -- Speeds up queries filtering by material
    INDEX                      idx_emissionFactorId (emissionFactorId)  -- Speeds up queries filtering by emission factor
);

CREATE TABLE StationaryCombustion
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    state      ENUM('solid', 'liquid', 'gas') NOT NULL,
    unit       VARCHAR(50)  NOT NULL,
    fuel_types VARCHAR(255) NOT NULL,
    name       VARCHAR(255) NOT NULL,
    UNIQUE INDEX idx_name (name) -- Ensures unique fuel names for fast lookup
);

CREATE TABLE StationaryCombustionData
(
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    heat_content           DECIMAL(10, 4) NOT NULL,
    CO2                    DECIMAL(10, 4) NOT NULL,
    CH4                    DECIMAL(10, 4) NOT NULL,
    N2O                    DECIMAL(10, 4) NOT NULL,

    stationaryCombustionId INT            NOT NULL,
    emissionFactorId       INT            NOT NULL,

    FOREIGN KEY (emissionFactorId) REFERENCES EmissionFactor (id),
    FOREIGN KEY (stationaryCombustionId) REFERENCES StationaryCombustion (id),

    INDEX                  idx_emissionFactorId (emissionFactorId),
    INDEX                  idx_stationaryCombustionId (stationaryCombustionId)
);


CREATE TABLE Scope2Data
(
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    emissionFactorId    INT            NOT NULL,

    -- Electric consumption by region
    electric_peninsular DECIMAL(10, 4) NOT NULL,
    electric_sabah      DECIMAL(10, 4) NOT NULL,
    electric_sarawak    DECIMAL(10, 4) NOT NULL,
    electric_unit       VARCHAR(50)    NOT NULL,

    -- Steam emissions
    steam_CO2           DECIMAL(10, 4) NOT NULL,
    steam_CH4           DECIMAL(10, 4) NOT NULL,
    steam_N2O           DECIMAL(10, 4) NOT NULL,

    -- Cooling emissions
    cooling_CO2         DECIMAL(10, 4) NOT NULL,
    cooling_CH4         DECIMAL(10, 4) NOT NULL,
    cooling_N2O         DECIMAL(10, 4) NOT NULL,

    -- Heat emissions
    heat_CO2            DECIMAL(10, 4) NOT NULL,
    heat_CH4            DECIMAL(10, 4) NOT NULL,
    heat_N2O            DECIMAL(10, 4) NOT NULL,

    -- Foreign Key
    FOREIGN KEY (emissionFactorId) REFERENCES EmissionFactor (id) ON DELETE CASCADE,

    -- Indexes for performance optimization
    INDEX               idx_emissionFactor (emissionFactorId)
);

SELECT JSON_OBJECT(
               'peninsular', electric_peninsular,
               'sabah', electric_sabah,
               'sarawak', electric_sarawak,
               'unit', electric_unit
       ) AS electric,

       JSON_OBJECT(
               'CO2', steam_CO2,
               'CH4', steam_CH4,
               'N2O', steam_N2O
       ) AS steam,

       JSON_OBJECT(
               'CO2', cooling_CO2,
               'CH4', cooling_CH4,
               'N2O', cooling_N2O
       ) AS cooling,

       JSON_OBJECT(
               'CO2', heat_CO2,
               'CH4', heat_CH4,
               'N2O', heat_N2O
       ) AS heat
FROM Scope2Data
WHERE emissionFactorId = ?;

CREATE TABLE MobileCombustionLitre
(
    id        INT AUTO_INCREMENT PRIMARY KEY,
    fuel_type VARCHAR(255) NOT NULL
);

CREATE TABLE MobileCombustionLitreData
(
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    mobileCombustionLitreId INT            NOT NULL,
    CO2                     DECIMAL(10, 4) NOT NULL,
    CH4                     DECIMAL(10, 4) NOT NULL,
    N2O                     DECIMAL(10, 4) NOT NULL,
    FOREIGN KEY (mobileCombustionLitreId) REFERENCES MobileCombustionLitre (id) ON DELETE CASCADE,
    INDEX                   idx_mobileCombustionLitre (mobileCombustionLitreId)
);

CREATE TABLE MobileCombustionDistance
(
    id           INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type VARCHAR(255) NOT NULL,
    fuel_type    VARCHAR(255) NOT NULL,
);

CREATE TABLE MobileCombustionDistanceData
(
    id                         INT AUTO_INCREMENT PRIMARY KEY,
    emissionFactorId           INT            NOT NULL,
    mobileCombustionDistanceId INT            NOT NULL,
    litreId                    INT            NOT NULL,
    CO2                        DECIMAL(10, 4) NOT NULL,
    CH4                        DECIMAL(10, 4) NOT NULL,
    N2O                        DECIMAL(10, 4) NOT NULL,

    FOREIGN KEY (emissionFactorId) REFERENCES EmissionFactor (id) ON DELETE CASCADE,
    FOREIGN KEY (mobileCombustionDistanceId) REFERENCES MobileCombustionDistance (id) ON DELETE CASCADE,
    FOREIGN KEY (litreId) REFERENCES MobileCombustionLitreData (id) ON DELETE CASCADE,

    INDEX                      idx_emissionFactor (emissionFactorId),
    INDEX                      idx_mobileCombustionDistance (mobileCombustionDistanceId),
    INDEX                      idx_litre (litreId)
);
 ```

```sql

CREATE TABLE Links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(2048) NOT NULL,
  type ENUM('url', 'imageUrl', 'fileUpload') NOT NULL,  -- Categorizes the link type
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Linkable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  linkId INT NOT NULL,
  referenceId INT NOT NULL,
  referenceType ENUM('WasteGenerated', 'StationaryCombustionData', 'MobileCombustionDistanceData', 'MobileCombustionLitreData', 'Scope2Data') NOT NULL,
  FOREIGN KEY (linkId) REFERENCES Links(id),
  INDEX idx_reference (referenceId, referenceType)
);

--- Transaction
START TRANSACTION;
-- Step 1: Insert the new link
INSERT INTO Links (url, type) VALUES ('https://example.com/image.jpg', 'imageUrl');

-- Step 2: Get the last inserted Link ID
SET @last_link_id = LAST_INSERT_ID();

-- Step 3: Insert into Linkable (associating with a WasteGenerated entry, for example)
INSERT INTO Linkable (linkId, referenceId, referenceType)
VALUES (@last_link_id, 5, 'WasteGenerated');

COMMIT;
```