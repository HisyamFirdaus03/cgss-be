import { inject } from '@loopback/core'
import { UseCase, UserWithUagAndUserDetail } from '../../../../../common'
import { UserFilter } from '../../../../../common/types/arguments/user-filter'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserFindById {
  export class v1 implements UseCase<UserFilter, UserWithUagAndUserDetail> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: UserFilter): Promise<UserWithUagAndUserDetail> {
      return this.userDomainService.findById(params.userId, params.filter)
    }
  }
}
