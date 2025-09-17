import { inject } from '@loopback/core'
import { UseCase } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseVerifyEmailByToken {
  export class v1 implements UseCase<void, string> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(): Promise<string> {
      return this.userDomainService.verifyEmail()
    }
  }
}
