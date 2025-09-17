import { Entity, model, property, belongsTo } from '@loopback/repository'
import { User } from './user.model'
import { GroupBy } from './group-by.model'

@model({
  settings: {
    mysql: { table: 'UserGroupByMap' },
    indexes: {
      unique_user_groupBy: {
        keys: { userId: 1, groupById: 1 },
        options: { unique: true },
      },
    },
  },
})
export class UserGroupByMap extends Entity {
  @property({ type: 'number', id: true, generated: true })
  id?: number

  @belongsTo(() => User, { name: 'user' })
  userId: number

  @belongsTo(() => GroupBy, { name: 'groupBy' })
  groupById: number

  constructor(data?: Partial<UserGroupByMap>) {
    super(data)
  }
}

export interface UserGroupByMapRelations {
  user?: User
  groupBy?: GroupBy
}

export type UserGroupByMapWithRelations = UserGroupByMap & UserGroupByMapRelations



