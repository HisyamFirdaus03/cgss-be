import { Binding, Component } from '@loopback/core'
import { SecuritySchemeBindings } from '../../security-scheme-service.bindings'
import { BearerImpl } from './impl'

export class BearerComponent implements Component {
  bindings: Binding[] = [Binding.bind(SecuritySchemeBindings.v1.Service.Bearer).toClass(BearerImpl.v1)]
}
