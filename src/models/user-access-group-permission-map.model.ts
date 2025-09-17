import { Entity, model, property, belongsTo } from '@loopback/repository'
import { UserAccessGroup } from './user-access-group.model'
import { Permission } from './permission.model'

@model()
export class UserAccessGroupPermissionMap extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @belongsTo(() => UserAccessGroup, { name: 'userAccessGroup' })
  accessGroupId: number

  @belongsTo(() => Permission, { name: 'permission' })
  permissionId: number

  constructor(data?: Partial<UserAccessGroupPermissionMap>) {
    super(data)
  }
}

export interface UserAccessGroupPermissionMapRelations {
  userAccessGroup?: UserAccessGroup
  permission?: Permission
}

export type UserAccessGroupPermissionMapWithRelations =
  UserAccessGroupPermissionMap
  & UserAccessGroupPermissionMapRelations


