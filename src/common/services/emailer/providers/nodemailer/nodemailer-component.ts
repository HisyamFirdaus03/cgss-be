import { Binding, Component } from '@loopback/core'
import { EmailerServiceBindings } from '../../emailer.bindings'
import { NodemailerImpl } from './impl'

// Component
export class NodemailerComponent implements Component {
  bindings: Binding[] = [Binding.bind(EmailerServiceBindings.Service.Nodemailer).toClass(NodemailerImpl)]
}
