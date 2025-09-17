import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { NodemailerComponent } from './providers'

export class EmailerComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(NodemailerComponent)
  }
}
