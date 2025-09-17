import { Binding, Component } from '@loopback/core'
import { UserUagServiceProvider } from './providers'
import { UserUagServiceBindings } from './user-uag-service.bindings'

export class UserUagServiceComponent implements Component {
  bindings: Binding[] = [Binding.bind(UserUagServiceBindings.v1).toClass(UserUagServiceProvider.v1)]
}
