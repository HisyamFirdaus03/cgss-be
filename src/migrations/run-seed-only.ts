import { LoopbackJwtCasbinBasic } from '../application'
import { seedGeneral } from './version0/1-general-seed'
import { seedPermissions } from './version0/4-permission-seed'
import { seedEmission } from './version0/3-emission-seed'
import { EmissionFactorRepository } from '../repositories'
import { EmissionFactor } from '../models'
import { _2023 } from './version0/seed-emission-factor'
import { initTenantDataSource } from '../index'

/**
 * Run seed data only (without migration)
 * Usage: ts-node src/migrations/run-seed-only.ts
 */
async function runSeedOnly() {
  const app = new LoopbackJwtCasbinBasic()
  await app.boot()
  await initTenantDataSource(app)

  // Bind to demo database
  const ds = await app.get('datasources.db.cgss_demo')
  app.bind('datasources.db').to(ds)

  // Get emission factor for seeding
  const emissionFactorRepository = await app.getRepository(EmissionFactorRepository)
  const emissionFactors = (await emissionFactorRepository.findOne()) ?? ({ year: 2023, ..._2023['2023'] } as EmissionFactor)

  console.log('🌱 Running seed data...')

  // Run seeds
  await seedGeneral(app)
  console.log('✅ General seed completed (users, roles)')

  await seedPermissions(app)
  console.log('✅ Permissions seed completed')

  await seedEmission(app, emissionFactors!)
  console.log('✅ Emission seed completed')

  console.log('🎉 All seeds completed successfully!')

  app.stop()
  process.exit(0)
}

runSeedOnly().catch((err) => {
  console.error('❌ Error running seed:', err)
  process.exit(1)
})
