import { BindingKey } from '@loopback/core'
import { RefreshTokenDomainService } from './refresh-token-domain.service'

// Bindings
export namespace RefreshTokenDomainServiceBindings {
  export const v1 = BindingKey.create<RefreshTokenDomainService.v1>('v1.refresh.token.domain.service')
}
