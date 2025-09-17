import { inject } from '@loopback/core'
import { UseCase, UserWithLoginSession, WebLoginCredential } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserLogin {
  export class v1 implements UseCase<WebLoginCredential, UserWithLoginSession> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    async call(params: WebLoginCredential): Promise<UserWithLoginSession> {
      return this.userDomainService.login(params.usernameOrEmail, params.password)
    }
  }
}
