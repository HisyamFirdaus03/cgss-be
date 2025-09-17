import { Binding, Component } from '@loopback/core'
import { UagUserDomainServiceProvider } from './providers'
import { UagUsersDomainServiceBindings } from './uag-user-domain-service.bindings'

// Component
export class UagUserDomainServiceComponent implements Component {
  bindings: Binding[] = [Binding.bind(UagUsersDomainServiceBindings.v1).toClass(UagUserDomainServiceProvider.v1)]
}
