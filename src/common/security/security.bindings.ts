import { BindingKey } from '@loopback/core'
import { SecurityService } from './security.service'

export namespace SecurityServiceBindings {
  export namespace Usr {
    export const v1 = BindingKey.create<SecurityService.Usr.v1>('v1.security.user.service.bindings')
  }
}
