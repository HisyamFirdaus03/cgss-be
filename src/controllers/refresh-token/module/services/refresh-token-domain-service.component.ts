import { Binding, Component } from '@loopback/core'
import { RefreshTokenDomainServiceProvider } from './providers'
import { RefreshTokenDomainServiceBindings } from './refresh-token-domain-service.bindings'

// Component
export class RefreshTokenDomainServiceComponent implements Component {
  bindings: Binding[] = [
    Binding.bind(RefreshTokenDomainServiceBindings.v1).toClass(RefreshTokenDomainServiceProvider.v1),
  ]
}
