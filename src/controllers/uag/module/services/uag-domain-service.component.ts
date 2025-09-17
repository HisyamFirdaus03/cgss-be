import { Binding, Component } from '@loopback/core'
import { UagDomainServiceProvider } from './providers'
import { UagDomainServiceBindings } from './uag-domain-service.bindings'

// Component
export class UagDomainServiceComponent implements Component {
  bindings: Binding[] = [Binding.bind(UagDomainServiceBindings.v1).toClass(UagDomainServiceProvider.v1)]
}
