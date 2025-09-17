import { Filter } from '@loopback/repository'
import { UserAccessGroup } from '../../../../models'
import { UagWithUserPagedUsers } from '../../../../common'

// Services
export namespace UagDomainService {
  export interface v1 {
    getManagedUags(filter?: Filter<UserAccessGroup>): Promise<UagWithUserPagedUsers[]>
  }
}
