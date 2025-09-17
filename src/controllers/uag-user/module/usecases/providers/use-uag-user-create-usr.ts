import { inject } from '@loopback/core'
import { UseCase, UserWithUserDetail, UserWithUserDetailModel } from '../../../../../common'

import { UagUsersDomainService, UagUsersDomainServiceBindings } from '../../services'

export namespace UseUagUserCreateUsr {
  export class v1 implements UseCase<UserWithUserDetailModel, UserWithUserDetail> {
    constructor(@inject(UagUsersDomainServiceBindings.v1) protected uagUserDomainService: UagUsersDomainService.v1) {}
    call(params: UserWithUserDetailModel): Promise<UserWithUserDetail> {
      const { uagIdentifier, ...user } = params
      return this.uagUserDomainService.byUagCreateUsr(uagIdentifier, user)
    }
  }
}
