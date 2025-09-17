import { Application, Component, CoreBindings, createBindingFromClass, inject } from '@loopback/core'
import { AccessTokenEnhancerImpl, AuthorizationEnhancerImpl, BearerEnhancerImpl } from './impl'

export class SecuritySchemeEnhancerComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.add(createBindingFromClass(AccessTokenEnhancerImpl))
    app.add(createBindingFromClass(AuthorizationEnhancerImpl))
    app.add(createBindingFromClass(BearerEnhancerImpl))
  }
}
