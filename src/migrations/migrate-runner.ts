import { LoopbackJwtCasbinBasic } from '../application'
import { seedGeneral } from './version0/1-general-seed'
import { seedPermissions } from './version0/4-permission-seed'
// import { seedPlants } from './version0/2-plants-seed'
import { seedEmission } from './version0/3-emission-seed'
import { EmissionFactorRepository } from '../repositories'
import { EmissionFactor } from '../models'
import { _2023 } from './version0/seed-emission-factor'
import { initTenantDataSource } from '../index'
import { addGroupHierarchy } from './version1/0-add-group-hierarchy'

// run LB4_App for each target DB we want to run
export async function migrate() {
  const existingSchema = process.env.DATABASE_LB4_MIGRATE_ACTION as 'alter' | 'drop'

  const app = new LoopbackJwtCasbinBasic()
  await app.boot()
  await initTenantDataSource(app)

  // Check again this flow, during migrate
  const ds = await app.get(process.env.DATABASE_LB4_PATH as string)
  app.bind('datasources.db').to(ds)

  // if migrate === 'drop' then we need to copy one of EF so that emission data activities can be generated
  const emissionFactorRepository = await app.getRepository(EmissionFactorRepository)
  const emissionFactors = (await emissionFactorRepository.findOne()) ?? ({ year: 2023, ..._2023['2023'] } as EmissionFactor)

  await app.migrateSchema({ existingSchema })

  // Extract tenant database name from environment variable
  // Example: datasources.db.cgss_demo -> cgss_demo
  const dbPath = process.env.DATABASE_LB4_PATH as string
  const tenantDb = dbPath.split('.').pop() || 'cgss_demo'

  // Run custom hierarchy migration (adds indexes, foreign keys, constraints)
  if (existingSchema === 'alter') {
    console.log(`Running custom GroupBy hierarchy migration for ${tenantDb}...`)
    await addGroupHierarchy(app, tenantDb)
  }

  if (existingSchema === 'drop') {
    await seedGeneral(app)
    await seedPermissions(app)
    // await seedPlants(app)
    await seedEmission(app, emissionFactors!)
  }

  app.stop()
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Error', err)
  process.exit(1)
})
