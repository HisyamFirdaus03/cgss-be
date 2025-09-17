import { Entity, model, property, belongsTo } from '@loopback/repository'
import { User } from './user.model'
import { UserAccessGroup } from './user-access-group.model'

@model()
export class UserAccessGroupMap extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @belongsTo(() => User, { name: 'user' })
  userId: number

  @belongsTo(() => UserAccessGroup, { name: 'userAccessGroup' })
  accessGroupId: number

  constructor(data?: Partial<UserAccessGroupMap>) {
    super(data)
  }
}

export interface UserAccessGroupMapRelations {
  user?: User;
  userAccessGroup?: UserAccessGroup;
}

export type UserAccessGroupMapWithRelations = UserAccessGroupMap & UserAccessGroupMapRelations
