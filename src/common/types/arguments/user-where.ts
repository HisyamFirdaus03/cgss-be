import { Where } from '@loopback/repository'
import { User } from '../../../models'

export interface UserWhere {
  user: Partial<User>
  where?: Where<User>
}
