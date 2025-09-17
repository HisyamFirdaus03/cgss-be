import { inject } from '@loopback/core'
import { UseCase, UserUagId } from '../../../../../common'
import { UserAccessGroup } from '../../../../../models'
import { UserUagService, UserUagServiceBindings } from '../../services'

export namespace UseUserUagLinkByUagId {
  export class v1 implements UseCase<UserUagId, UserAccessGroup[]> {
    constructor(
      @inject(UserUagServiceBindings.v1)
      private userUagService: UserUagService.v1
    ) {}
    call(params: UserUagId): Promise<UserAccessGroup[]> {
      return this.userUagService.linkByUserAccessGroupId(params.userId, params.uagId)
    }
  }
}
