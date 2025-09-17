import { inject } from '@loopback/core'
import { UseCase, UserWithLoginSession } from '../../../../../common'
import { RefreshTokenDomainService, RefreshTokenDomainServiceBindings } from '../../services'

export namespace UseRefreshTokenRefreshedAccessToken {
  export class v1 implements UseCase<void, UserWithLoginSession> {
    constructor(
      @inject(RefreshTokenDomainServiceBindings.v1)
      public refreshTokenDomainService: RefreshTokenDomainService.v1
    ) {}

    async call(): Promise<UserWithLoginSession> {
      return this.refreshTokenDomainService.refreshAccessToken()
    }
  }
}
