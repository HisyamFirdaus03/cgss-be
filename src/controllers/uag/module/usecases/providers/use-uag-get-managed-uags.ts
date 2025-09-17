import { inject } from '@loopback/core'
import { Filter } from '@loopback/repository'
import { UseCase } from '../../../../../common'
import { UagWithUserPagedUsers } from '../../../../../common'
import { UserAccessGroup } from '../../../../../models'

import { UagDomainService, UagDomainServiceBindings } from '../../services'

export namespace UseUagGetManagedUags {
  export class v1 implements UseCase<Filter<UserAccessGroup>, UagWithUserPagedUsers[]> {
    constructor(@inject(UagDomainServiceBindings.v1) protected uagDomainService: UagDomainService.v1) {}
    async call(params?: Filter<UserAccessGroup>): Promise<UagWithUserPagedUsers[]> {
      return this.uagDomainService.getManagedUags(params)
    }
  }
}
