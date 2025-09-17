import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { UagDomainServiceComponent } from './services'
import { UagControllerUseCasesComponent } from './usecases'

export class UagComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(UagDomainServiceComponent)
    app.component(UagControllerUseCasesComponent)
  }
}
