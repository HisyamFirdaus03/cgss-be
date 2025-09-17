import { BindingKey } from '@loopback/core'
import { UserDomainService } from './user-domain.service'

// Bindings
export namespace UserDomainServiceBindings {
  export const v1 = BindingKey.create<UserDomainService.v1>('v1.user.domain.service.bindings')
}
