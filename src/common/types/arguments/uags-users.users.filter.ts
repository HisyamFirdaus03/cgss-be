import { Filter } from '@loopback/repository'
import { UserAccessLevel } from '../../authz'
import { User } from '../../../models'

export interface UagsUsersUsersFilter {
  uagIdentifier: number | UserAccessLevel.name
  filter?: Filter<User>
}
