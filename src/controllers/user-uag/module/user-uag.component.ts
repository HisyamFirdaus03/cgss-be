import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { UserUagServiceComponent } from './services'
import { UserUagControllerUseCasesComponent } from './usecases'

export class UserUagComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(UserUagServiceComponent)
    app.component(UserUagControllerUseCasesComponent)
  }
}
