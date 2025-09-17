import { BindingKey } from '@loopback/core'
import { UserUagService } from './user-uag.service'

export namespace UserUagServiceBindings {
  export const v1 = BindingKey.create<UserUagService.v1>('v1.user.user.access.group.service.bindings')
}
