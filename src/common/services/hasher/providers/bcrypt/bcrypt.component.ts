import { Binding, Component } from '@loopback/core'
import { HasherConstantBindings, HasherServiceBindings } from '../../hasher-bindings'
import { BcryptConstants } from './bcrypt.constants'
import { BcryptImpl } from './impl'

export class BcryptComponent implements Component {
  // prettier-ignore
  bindings: Binding[] = [
    Binding.bind(HasherServiceBindings.Service.Bcrypt).toClass(BcryptImpl),
    Binding.bind(HasherConstantBindings.Bcrypt.Rounds).to(BcryptConstants.ROUNDS)
  ]
}
