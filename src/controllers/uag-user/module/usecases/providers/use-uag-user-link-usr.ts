import { inject } from '@loopback/core'
import { UagUser, UseCase, UserWithUag } from '../../../../../common'
import { UagUsersDomainService, UagUsersDomainServiceBindings } from '../../services'

export namespace UseUagUserLinkUsr {
  export class v1 implements UseCase<UagUser, UserWithUag> {
    constructor(@inject(UagUsersDomainServiceBindings.v1) protected uagUserDomainService: UagUsersDomainService.v1) {}
    call(params: UagUser): Promise<UserWithUag> {
      return this.uagUserDomainService.byUagLinkUsr(params.uagIdentifier, params.usrId)
    }
  }
}
