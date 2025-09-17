import { inject } from '@loopback/core'
import { UagsUsersUsersFilter, UseCase, UserWithUagAndUserDetailPagedUser } from '../../../../../common'
import { UagUsersDomainService, UagUsersDomainServiceBindings } from '../../services'

export namespace UseUagUserFindUsrs {
  export class v1 implements UseCase<UagsUsersUsersFilter, UserWithUagAndUserDetailPagedUser> {
    constructor(@inject(UagUsersDomainServiceBindings.v1) protected uagUserDomainService: UagUsersDomainService.v1) {}
    call(params: UagsUsersUsersFilter): Promise<UserWithUagAndUserDetailPagedUser> {
      return this.uagUserDomainService.byUagFindUsrs(params.uagIdentifier, params.filter)
    }
  }
}
