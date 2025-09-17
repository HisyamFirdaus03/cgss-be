import { inject } from '@loopback/core'
import { UseCase } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserRequestEmailVerificationById {
  export class v1 implements UseCase<number, string> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: number): Promise<string> {
      return this.userDomainService.requestEmailVerificationById(params)
    }
  }
}
