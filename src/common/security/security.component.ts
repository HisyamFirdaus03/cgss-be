import { Binding, Component } from '@loopback/core'
import { SecurityServiceProvider } from './providers'
import { SecurityServiceBindings } from './security.bindings'

export class SecurityServiceComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(SecurityServiceBindings.Usr.v1).toClass(SecurityServiceProvider.Usr.v1),
  ]
}
