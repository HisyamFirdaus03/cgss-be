import { AuthenticationComponent } from '@loopback/authentication'
import { AuthorizationBindings, AuthorizationComponent, AuthorizationDecision } from '@loopback/authorization'
import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { AuthnStrategiesComponent } from './strategies'

export class AuthnComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(AuthenticationComponent)
    app.component(AuthorizationComponent)
    app
      .configure(AuthorizationBindings.COMPONENT)
      .to({ precedence: AuthorizationDecision.ALLOW, defaultDecision: AuthorizationDecision.DENY })

    app.component(AuthnStrategiesComponent)
  }
}
