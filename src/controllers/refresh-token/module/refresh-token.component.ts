import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { RefreshTokenDomainServiceComponent } from './services'
import { RefreshControllerTokenUseCasesComponent } from './usecases'

export class RefreshTokenComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(RefreshTokenDomainServiceComponent)
    app.component(RefreshControllerTokenUseCasesComponent)
  }
}
