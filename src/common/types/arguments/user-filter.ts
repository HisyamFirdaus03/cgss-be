import { FilterExcludingWhere } from '@loopback/repository'
import { User } from '../../../models'

export interface UserFilter {
  userId: number
  filter?: FilterExcludingWhere<User>
}
