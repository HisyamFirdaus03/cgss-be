import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { UagUserDomainServiceComponent } from './services'
import { UagUserControllerUseCasesComponent } from './usecases'

export class UagUserComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(UagUserDomainServiceComponent)
    app.component(UagUserControllerUseCasesComponent)
  }
}
