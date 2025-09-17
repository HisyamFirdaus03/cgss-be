import { inject } from '@loopback/core'
import { UseCase } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserRequestResetPassword {
  export class v1 implements UseCase<{ usernameOrEmail: string }, string> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: { usernameOrEmail: string }): Promise<string> {
      return this.userDomainService.requestResetPassword(params.usernameOrEmail)
    }
  }
}
