import { BindingKey } from '@loopback/core'
import { UseCase, UserWithLoginSession, UserWithUagAndUserDetail } from '../../../../common'

// Bindings
export namespace RefreshTokenControllerUseCasesBindings {
  export namespace v1 {
    export const UseRefreshTokenTokenOwner = BindingKey.create<UseCase<void, UserWithUagAndUserDetail>>(
      'v1.use.refresh-token.get.token.owner'
    )
    export const UseRefreshTokenRefreshedAccessToken = BindingKey.create<UseCase<void, UserWithLoginSession>>(
      'v1.use.refresh-token.get.refreshed.access.token'
    )
  }
}
