import { inject } from '@loopback/core'
import { UseCase, WebLoginCredential } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserRequestEmailVerificationByCred {
  export class v1 implements UseCase<WebLoginCredential, string> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: WebLoginCredential): Promise<string> {
      return this.userDomainService.requestEmailVerificationByCredential(params.usernameOrEmail, params.password)
    }
  }
}
