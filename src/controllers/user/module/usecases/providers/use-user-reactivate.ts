import { inject } from '@loopback/core'
import { UseCase, UserWithUserDetail } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserReactivate {
  export class v1 implements UseCase<number, UserWithUserDetail> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: number): Promise<UserWithUserDetail> {
      return this.userDomainService.reactivate(params)
    }
  }
}
