import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { UsrDetailAuthorizerComponent } from './voters'

export class UsrDetailComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(UsrDetailAuthorizerComponent)
  }
}
