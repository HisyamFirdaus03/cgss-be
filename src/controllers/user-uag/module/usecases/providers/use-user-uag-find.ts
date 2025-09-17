import { inject } from '@loopback/core'
import { UseCase } from '../../../../../common'
import { UserAccessGroup } from '../../../../../models'
import { UserUagService, UserUagServiceBindings } from '../../services'

export namespace UseUserUagFind {
  export class v1 implements UseCase<number, UserAccessGroup[]> {
    constructor(
      @inject(UserUagServiceBindings.v1)
      private userUagService: UserUagService.v1
    ) {}
    call(params: number): Promise<UserAccessGroup[]> {
      return this.userUagService.findUserAccessGroupsByUserId(params)
    }
  }
}
