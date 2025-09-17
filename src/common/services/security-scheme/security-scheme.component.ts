import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { AccessTokenComponent, AuthorizationComponent, BearerComponent } from './providers'

export class SecuritySchemeComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(AccessTokenComponent)
    app.component(AuthorizationComponent)
    app.component(BearerComponent)
  }
}
