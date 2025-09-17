import { inject } from '@loopback/core'
import { UagUser, UseCase, UserWithUag } from '../../../../../common'
import { UagUsersDomainService, UagUsersDomainServiceBindings } from '../../services'

export namespace UseUagUserUnlinkUsr {
  export class v1 implements UseCase<UagUser, UserWithUag> {
    constructor(@inject(UagUsersDomainServiceBindings.v1) protected uagUserDomainService: UagUsersDomainService.v1) {}
    async call(params: UagUser): Promise<UserWithUag> {
      return this.uagUserDomainService.byUagUnlinkUsr(params.uagIdentifier, params.usrId)
    }
  }
}
