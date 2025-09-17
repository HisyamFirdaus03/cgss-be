import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { BcryptComponent } from './providers'

export class HasherComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(BcryptComponent)
  }
}
