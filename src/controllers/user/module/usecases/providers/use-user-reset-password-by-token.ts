import { inject } from '@loopback/core'
import { UseCase } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserResetPasswordByToken {
  export class v1 implements UseCase<{ password: string }, string> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: { password: string }): Promise<string> {
      return this.userDomainService.resetPasswordByToken(params.password)
    }
  }
}
