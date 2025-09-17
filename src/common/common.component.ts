import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { AuthnComponent } from './authn'
import { AuthzComponent } from './authz'
import { SecurityServiceComponent } from './security'
import { ServiceComponent } from './services'
import { MultiTenancyComponent } from '../multi-tenancy/component'

export class CommonComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(AuthnComponent)
    app.component(AuthzComponent)
    app.component(SecurityServiceComponent)
    app.component(ServiceComponent)
    app.component(MultiTenancyComponent)
  }
}
