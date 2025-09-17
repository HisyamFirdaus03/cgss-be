import { Binding, Component } from '@loopback/core'
import { SecuritySchemeBindings } from '../../security-scheme-service.bindings'
import { AccessTokenImpl } from './impl'

export class AccessTokenComponent implements Component {
  bindings: Binding[] = [Binding.bind(SecuritySchemeBindings.v1.Service.AccessToken).toClass(AccessTokenImpl.v1)]
}
