import { inject } from '@loopback/core'
import { UseCase, UserLogout } from '../../../../../common'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserLogout {
  export class v1 implements UseCase<void, UserLogout | null> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    async call(): Promise<UserLogout | null> {
      return this.userDomainService.logout()
    }
  }
}
