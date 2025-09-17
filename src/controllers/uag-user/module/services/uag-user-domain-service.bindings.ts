import { BindingKey } from '@loopback/core'
import { UagUsersDomainService } from './uag-user-domain.service'

// Bindings
export namespace UagUsersDomainServiceBindings {
  export const v1 = BindingKey.create<UagUsersDomainService.v1>('v1.user.access.group.user.domain.service.bindings')
}
