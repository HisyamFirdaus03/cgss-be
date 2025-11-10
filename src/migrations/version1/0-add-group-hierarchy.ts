import { LoopbackJwtCasbinBasic } from '../../application'
import { GroupByRepository } from '../../repositories'

/**
 * Migration: Add hierarchy support to GroupBy model
 *
 * This migration adds the following columns to GroupBy table:
 * - parentId: Reference to parent group (nullable for root groups)
 * - level: Type of organizational unit (hq, subsidiary, branch, department)
 * - depth: Tree depth level (0 for root, 1 for first level, etc.)
 *
 * All existing groups will be set as root level (parentId = null, level = 'hq', depth = 0)
 */

export const addGroupHierarchy = async (app: LoopbackJwtCasbinBasic, tenantDb: string) => {
  const groupByRepository = await app.getRepository(GroupByRepository)

  console.log(`[${tenantDb}] Adding hierarchy columns to GroupBy table...`)

  // Step 1: Add new columns
  const addColumnsSQL = `
    ALTER TABLE ${tenantDb}.GroupBy
      ADD COLUMN IF NOT EXISTS parentId INT NULL,
      ADD COLUMN IF NOT EXISTS level VARCHAR(50) NOT NULL DEFAULT 'hq',
      ADD COLUMN IF NOT EXISTS depth INT NOT NULL DEFAULT 0;
  `

  try {
    await groupByRepository.execute(addColumnsSQL)
    console.log(`[${tenantDb}] ✓ Columns added successfully`)
  } catch (error: any) {
    // Handle case where columns already exist
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log(`[${tenantDb}] ⚠ Columns already exist, skipping...`)
    } else {
      throw error
    }
  }

  // Step 2: Update existing data (set all as root level)
  const updateExistingDataSQL = `
    UPDATE ${tenantDb}.GroupBy
    SET parentId = NULL, level = 'hq', depth = 0
    WHERE parentId IS NULL AND level IS NULL;
  `

  await groupByRepository.execute(updateExistingDataSQL)
  console.log(`[${tenantDb}] ✓ Existing groups set as root level`)

  // Step 3: Add foreign key constraint
  const addConstraintSQL = `
    ALTER TABLE ${tenantDb}.GroupBy
      ADD CONSTRAINT fk_groupby_parent
      FOREIGN KEY (parentId) REFERENCES ${tenantDb}.GroupBy(id)
      ON DELETE CASCADE;
  `

  try {
    await groupByRepository.execute(addConstraintSQL)
    console.log(`[${tenantDb}] ✓ Foreign key constraint added`)
  } catch (error: any) {
    // Handle case where constraint already exists
    if (error.code === 'ER_DUP_KEYNAME' || error.errno === 1826) {
      console.log(`[${tenantDb}] ⚠ Foreign key constraint already exists, skipping...`)
    } else {
      console.error(`[${tenantDb}] ⚠ Could not add foreign key (may already exist):`, error.message)
    }
  }

  // Step 4: Add indexes for performance
  const addIndexesSQL = `
    CREATE INDEX IF NOT EXISTS idx_groupby_parent ON ${tenantDb}.GroupBy(parentId);
    CREATE INDEX IF NOT EXISTS idx_groupby_level ON ${tenantDb}.GroupBy(level);
    CREATE INDEX IF NOT EXISTS idx_groupby_depth ON ${tenantDb}.GroupBy(depth);
  `

  try {
    await groupByRepository.execute(addIndexesSQL)
    console.log(`[${tenantDb}] ✓ Indexes created successfully`)
  } catch (error: any) {
    if (error.code === 'ER_DUP_KEYNAME') {
      console.log(`[${tenantDb}] ⚠ Indexes already exist, skipping...`)
    } else {
      throw error
    }
  }

  console.log(`[${tenantDb}] ✅ GroupBy hierarchy migration completed!`)
}

/**
 * Rollback: Remove hierarchy columns from GroupBy
 * WARNING: This will delete the hierarchy structure!
 */
export const removeGroupHierarchy = async (app: LoopbackJwtCasbinBasic, tenantDb: string) => {
  const groupByRepository = await app.getRepository(GroupByRepository)

  console.log(`[${tenantDb}] Rolling back hierarchy from GroupBy table...`)

  // Step 1: Drop foreign key constraint
  const dropConstraintSQL = `
    ALTER TABLE ${tenantDb}.GroupBy
      DROP FOREIGN KEY IF EXISTS fk_groupby_parent;
  `

  try {
    await groupByRepository.execute(dropConstraintSQL)
    console.log(`[${tenantDb}] ✓ Foreign key constraint dropped`)
  } catch (error: any) {
    console.error(`[${tenantDb}] ⚠ Could not drop foreign key:`, error.message)
  }

  // Step 2: Drop indexes
  const dropIndexesSQL = `
    DROP INDEX IF EXISTS idx_groupby_parent ON ${tenantDb}.GroupBy;
    DROP INDEX IF EXISTS idx_groupby_level ON ${tenantDb}.GroupBy;
    DROP INDEX IF EXISTS idx_groupby_depth ON ${tenantDb}.GroupBy;
  `

  await groupByRepository.execute(dropIndexesSQL)
  console.log(`[${tenantDb}] ✓ Indexes dropped`)

  // Step 3: Drop columns
  const dropColumnsSQL = `
    ALTER TABLE ${tenantDb}.GroupBy
      DROP COLUMN IF EXISTS parentId,
      DROP COLUMN IF EXISTS level,
      DROP COLUMN IF EXISTS depth;
  `

  await groupByRepository.execute(dropColumnsSQL)
  console.log(`[${tenantDb}] ✓ Columns dropped`)

  console.log(`[${tenantDb}] ✅ GroupBy hierarchy rollback completed!`)
}
