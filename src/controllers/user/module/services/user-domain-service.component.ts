import { Binding, Component } from '@loopback/core'
import { UserDomainServiceProvider } from './providers'
import { UserDomainServiceBindings } from './user-domain-service.bindings'

// Component
export class UserDomainServiceComponent implements Component {
  bindings: Binding[] = [Binding.bind(UserDomainServiceBindings.v1).toClass(UserDomainServiceProvider.v1)]
}
