import { ApplicationConfig } from '@loopback/core'
import { LoopbackJwtCasbinBasic } from './application'
import { Loopback4ServerConfig } from './configurations/secrets'

/**
 * Export the OpenAPI spec from the application
 */
async function exportOpenApiSpec(): Promise<void> {
  const config: ApplicationConfig = {
    rest: {
      port: Loopback4ServerConfig.port,
      host: Loopback4ServerConfig.host ?? 'localhost',
    },
  }
  const outFile = process.argv[2] ?? ''
  const app = new LoopbackJwtCasbinBasic(config)
  await app.boot()
  await app.exportOpenApiSpec(outFile)
}

exportOpenApiSpec().catch((err) => {
  console.error('Fail to export OpenAPI spec from the application.', err)
  process.exit(1)
})
