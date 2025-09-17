import { inject } from '@loopback/core'
import { Count, Where } from '@loopback/repository'
import { UseCase } from '../../../../../common'
import { User } from '../../../../../models'
import { UserDomainService, UserDomainServiceBindings } from '../../services'

export namespace UseUserCount {
  export class v1 implements UseCase<Where<User>, Count> {
    constructor(@inject(UserDomainServiceBindings.v1) private userDomainService: UserDomainService.v1) {}
    async call(params: Where<User>): Promise<Count> {
      return this.userDomainService.count(params)
    }
  }
}
