import { Entity, hasMany, model, property } from '@loopback/repository'
import { UserAccessGroupMap } from './user-access-group-map.model'
import { User } from './user.model'
import { Permission } from './permission.model'
import { UserAccessGroupPermissionMap } from './user-access-group-permission-map.model'

@model()
export class UserAccessGroup extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({
    type: 'string',
    required: true,
  })
  name: string

  @property({
    type: 'number',
    required: true,
  })
  priority: number

  @property({ type: 'string' })
  description?: string

  @property({
    type: 'date',
    defaultFn: 'now',
    mysql: {
      type: 'datetime',
    },
  })
  createdAt?: string

  @property({
    type: 'date',
    defaultFn: 'now',
    mysql: {
      type: 'datetime',
    },
  })
  updatedAt?: string

  @hasMany(() => User, { through: { model: () => UserAccessGroupMap, keyFrom: 'accessGroupId' } })
  users: User[]

  @hasMany(() => Permission, {
    through: { model: () => UserAccessGroupPermissionMap, keyFrom: 'accessGroupId', keyTo: 'permissionId' },
  })
  permissions: Permission[]

  constructor(data?: Partial<UserAccessGroup>) {
    super(data)
  }
}

export interface UserAccessGroupRelations {
  // describe navigational properties here
}

export type UserAccessGroupWithRelations = UserAccessGroup & UserAccessGroupRelations
