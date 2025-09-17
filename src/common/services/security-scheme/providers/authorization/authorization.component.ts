import { Binding, Component } from '@loopback/core'
import { SecuritySchemeBindings } from '../../security-scheme-service.bindings'
import { AuthorizationImpl } from './impl'

export class AuthorizationComponent implements Component {
  bindings: Binding[] = [Binding.bind(SecuritySchemeBindings.v1.Service.Authorization).toClass(AuthorizationImpl.v1)]
}
