import { BindingKey } from '@loopback/core'
import { UagDomainService } from './uag-domain.service'

// Bindings
export namespace UagDomainServiceBindings {
  export const v1 = BindingKey.create<UagDomainService.v1>('v1.uag.domain.service.bindings')
}
