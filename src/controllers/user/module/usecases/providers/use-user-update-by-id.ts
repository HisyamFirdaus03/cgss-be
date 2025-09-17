import { inject } from '@loopback/core'
import { UseCase, UserPatch, UserWithUserDetail } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserUpdateById {
  export class v1 implements UseCase<UserPatch, UserWithUserDetail> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: UserPatch): Promise<UserWithUserDetail> {
      const { id, ...user } = params
      return this.userDomainService.updateById(id!, user)
    }
  }
}
