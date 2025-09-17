import { BindingKey } from '@loopback/core'
import { SecuritySchemeService } from './security-scheme.service'

export namespace SecuritySchemeBindings {
  export namespace v1 {
    export namespace Service {
      export const AccessToken = BindingKey.create<SecuritySchemeService.v1>('security-scheme.access.token.service')
      export const Authorization = BindingKey.create<SecuritySchemeService.v1>('security-scheme.authorization.service')
      export const Bearer = BindingKey.create<SecuritySchemeService.v1>('security-scheme.bearer.service')
    }
  }
}
