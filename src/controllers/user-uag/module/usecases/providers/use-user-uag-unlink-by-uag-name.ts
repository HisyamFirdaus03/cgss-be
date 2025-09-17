import { inject } from '@loopback/core'
import { UseCase, UserUagName } from '../../../../../common'
import { UserAccessGroup } from '../../../../../models'
import { UserUagService, UserUagServiceBindings } from '../../services'

export namespace UseUserUagUnlinkByUagName {
  export class v1 implements UseCase<UserUagName, UserAccessGroup[]> {
    constructor(
      @inject(UserUagServiceBindings.v1)
      private userUagService: UserUagService.v1
    ) {}
    call(params: UserUagName): Promise<UserAccessGroup[]> {
      return this.userUagService.unlinkByUserAccessGroupName(params.userId, params.uagName)
    }
  }
}
