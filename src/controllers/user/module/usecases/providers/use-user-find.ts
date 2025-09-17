import { inject } from '@loopback/core'
import { Filter } from '@loopback/repository'
import { UseCase, UserWithUagAndUserDetailPagedUser } from '../../../../../common'
import { User } from '../../../../../models'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserFind {
  export class v1 implements UseCase<Filter<User>, UserWithUagAndUserDetailPagedUser> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params?: Filter<User>): Promise<UserWithUagAndUserDetailPagedUser> {
      return this.userDomainService.find(params)
    }
  }
}
