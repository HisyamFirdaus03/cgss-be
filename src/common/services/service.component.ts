import { Application, Component, CoreBindings, inject } from '@loopback/core'
import { EmailerComponent } from './emailer'
import { HasherComponent } from './hasher'
import { OasEnhancerComponent } from './oas-enhancer'
import { SecuritySchemeComponent } from './security-scheme'
import { TokenizerServiceComponent } from './tokenizer'

export class ServiceComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.component(EmailerComponent)
    app.component(HasherComponent)
    app.component(OasEnhancerComponent)
    app.component(SecuritySchemeComponent)
    app.component(TokenizerServiceComponent)
  }
}
