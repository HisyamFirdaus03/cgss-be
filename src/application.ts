import { BootMixin } from '@loopback/boot'
import { ApplicationConfig, createBindingFromClass } from '@loopback/core'
import { RepositoryMixin } from '@loopback/repository'
import { RestApplication, RestBindings } from '@loopback/rest'
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer'
import { ServiceMixin } from '@loopback/service-proxy'
import path from 'path'
import { CommonComponent } from './common'
import { ControllerComponent } from './controllers'
import { MySequence } from './sequence'
import {
  DatabaseConfig,
  EmailTransporter,
  EnvConfig,
  JwtUserAccessConfig,
  JwtUserPasswordConfig,
  JwtUserRefreshConfig,
  JwtUserVerificationConfig,
  Loopback4ServerConfig,
} from './configurations/secrets'
import { CronComponent } from '@loopback/cron'
import { CronEmployeeCommutingActivities } from './cron/cron-employee-commuting-activities'
import { Decimal } from 'decimal.js'
// import { faker } from '@faker-js/faker'

export { ApplicationConfig }

export class LoopbackJwtCasbinBasic extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options)

    Decimal.set({ rounding: Decimal.ROUND_DOWN })

    // Set up the custom sequence
    this.sequence(MySequence)

    // Set up default home page
    this.static('/', path.join(__dirname, '../public/api'))
    this.static('/public', path.join(__dirname, '../public'))
    this.static('/app/reset-password', path.join(__dirname, '../public/app/reset-password'))
    this.static('/app/verify-email', path.join(__dirname, '../public/app/verify-email'))
    this.bind(RestBindings.ERROR_WRITER_OPTIONS).to({ debug: EnvConfig.isDev }) // https://stackoverflow.com/a/55332766/3648961

    if (EnvConfig.isDev) {
      console.log('Logging envFile', {
        TZ: process.env.TZ,
        email: EmailTransporter,
        DB: DatabaseConfig,
        service: Loopback4ServerConfig,
        env: EnvConfig,
        jwt: {
          userAccess: Object.values(JwtUserAccessConfig).join(', '),
          userRefresh: Object.values(JwtUserRefreshConfig).join(', '),
          password: Object.values(JwtUserPasswordConfig).join(', '),
          verification: Object.values(JwtUserVerificationConfig).join(', '),
        },
      })
    } else {
      // from pm2 ecosystem.config.cjs
      console.log(`Instance ID: ${process.env.INSTANCE_ID} at port: ${Loopback4ServerConfig.port}`)
    }

    if (process.env.NODE_ENV === 'development') {
      this.configure(RestExplorerBindings.COMPONENT).to({ path: '/explorer' })
      this.component(RestExplorerComponent)
    }

    // ======================= Custom Bindings =================================
    this.component(CommonComponent)
    this.component(ControllerComponent)
    this.component(CronComponent)
    // =========================================================================

    // Cron job
    // in prod, we have 3 instance, so to avoid multiple triggers
    if ((EnvConfig.isProd && process.env.INSTANCE_ID === '0') || EnvConfig.isDev) {
      this.add(createBindingFromClass(CronEmployeeCommutingActivities))
    }

    this.projectRoot = __dirname

    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    }
  }
}

// (async () => {
//   const bcrypt = require('bcrypt');
//   const passwords = await Promise.all(Array.from({ length: 10 }, async (_, i) => {
//     const p = faker.internet.password({ length: 10 })

//     return {
//       p,
//       pHashed: await bcrypt.hash(p, await bcrypt.genSalt(10)),
//     }
//   }));

//   console.log(passwords)
// })();
