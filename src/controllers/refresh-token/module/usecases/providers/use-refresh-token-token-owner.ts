import { inject } from '@loopback/core'
import { UseCase, UserWithUagAndUserDetail } from '../../../../../common'
import { RefreshTokenDomainService, RefreshTokenDomainServiceBindings } from '../../services'

export namespace UseRefreshTokenTokenOwner {
  export class v1 implements UseCase<void, UserWithUagAndUserDetail> {
    constructor(
      @inject(RefreshTokenDomainServiceBindings.v1)
      public refreshTokenDomainService: RefreshTokenDomainService.v1
    ) {}
    async call(): Promise<UserWithUagAndUserDetail> {
      return await this.refreshTokenDomainService.getTokenOwner()
    }
  }
}
