import { inject } from '@loopback/core'
import { UseCase } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserResetPasswordById {
  export class v1 implements UseCase<{ userId: number; password: string }, string> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    call(params: { userId: number; password: string }): Promise<string> {
      return this.userDomainService.resetPasswordById(params.userId, params.password)
    }
  }
}
