import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { SecuritySchemeEnhancerComponent } from './providers'

export class OasEnhancerComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(SecuritySchemeEnhancerComponent)
  }
}
