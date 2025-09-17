import { registerAuthenticationStrategy } from '@loopback/authentication'
import { Application, Component, CoreBindings, inject } from '@loopback/core'
import {
  JwtUserAccessStrategy,
  JwtUserPasswordStrategy,
  JwtUserRefreshStrategy,
  JwtUserVerificationStrategy,
} from './providers'

export class AuthnStrategiesComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    registerAuthenticationStrategy(app, JwtUserAccessStrategy)
    registerAuthenticationStrategy(app, JwtUserPasswordStrategy)
    registerAuthenticationStrategy(app, JwtUserRefreshStrategy)
    registerAuthenticationStrategy(app, JwtUserVerificationStrategy)
  }
}
