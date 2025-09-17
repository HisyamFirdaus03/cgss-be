import { ApplicationConfig, LoopbackJwtCasbinBasic } from './application'
import { Loopback4ServerConfig } from './configurations/secrets'
import 'dotenv/config'
import { juggler } from '@loopback/repository'
import { CompanyInfoRepository } from './repositories'
import DataSource = juggler.DataSource

export async function main(options: ApplicationConfig = {}) {
  const app = new LoopbackJwtCasbinBasic(options)
  await app.boot()
  await app.start()
  await initTenantDataSource(app)

  console.log(`Loopback API Server is running at ${app.restServer.url}`)
  return app
}

export async function initTenantDataSource(app: ApplicationConfig) {
  const companyInfoRepo = await app.getRepository(CompanyInfoRepository)

  const ds$ = (await companyInfoRepo.connectDBs()).map((ds: DataSource) => {
    app.dataSource(ds, ds.name)
  })

  await Promise.all(ds$)
}

if (require.main === module) {
  const config = {
    rest: {
      port: Loopback4ServerConfig.port,
      host: Loopback4ServerConfig.host,
      basePath: '/api',
      expressSettings: { 'x-powered-by': false },
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
        endpointMapping:
          process.env.NODE_ENV === 'development'
            ? {
                '/openapi.json': { version: '3.0.0', format: 'json' },
                '/openapi.yaml': { version: '3.0.0', format: 'yaml' },
              }
            : {},
      },
    },
  }

  main(config).catch((err) => {
    console.error('Cannot start the application.', err)
    process.exit(1)
  })
}
