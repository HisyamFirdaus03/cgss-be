import { BindingKey } from '@loopback/core'
import { HasherService } from './hasher-service'

export namespace HasherServiceBindings {
  export namespace Service {
    export const Bcrypt = BindingKey.create<HasherService>('hasher.service.bcrypt.provider')
  }
}

export namespace HasherConstantBindings {
  export namespace Bcrypt {
    export const Rounds = BindingKey.create<number>('hasher.service.bcrypt.rounds')
  }
}
