import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { UserDomainServiceComponent } from './services'
import { UserControllerUseCasesComponent } from './usecases'

export class UserComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(UserDomainServiceComponent)
    app.component(UserControllerUseCasesComponent)
  }
}
