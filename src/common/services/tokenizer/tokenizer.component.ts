import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { JwtComponent } from './providers'

export class TokenizerServiceComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(JwtComponent)
  }
}
