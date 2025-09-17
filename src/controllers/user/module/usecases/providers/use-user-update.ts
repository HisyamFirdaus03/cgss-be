import { inject } from '@loopback/core'
import { Count } from '@loopback/repository'
import { UseCase, UserWhere } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserUpdate {
  export class v1 implements UseCase<UserWhere, Count> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: UserWhere): Promise<Count> {
      return this.userDomainService.updateAll(params.user, params.where)
    }
  }
}
