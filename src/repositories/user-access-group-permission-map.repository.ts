import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository'
import { DatabaseConfig } from '../configurations/secrets'
import { DemoDataSource } from '../datasources'
import { UserAccessGroupPermissionMap, UserAccessGroupPermissionMapRelations, UserAccessGroup, Permission } from '../models'
import { UserAccessGroupRepository } from './user-access-group.repository'
import { PermissionRepository } from './permission.repository'

export class UserAccessGroupPermissionMapRepository extends DefaultCrudRepository<
  UserAccessGroupPermissionMap,
  typeof UserAccessGroupPermissionMap.prototype.id,
  UserAccessGroupPermissionMapRelations
> {
  public readonly userAccessGroup: BelongsToAccessor<UserAccessGroup, typeof UserAccessGroupPermissionMap.prototype.id>
  public readonly permission: BelongsToAccessor<Permission, typeof UserAccessGroupPermissionMap.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('UserAccessGroupRepository') protected userAccessGroupRepositoryGetter: Getter<UserAccessGroupRepository>,
    @repository.getter('PermissionRepository') protected permissionRepositoryGetter: Getter<PermissionRepository>,
  ) {
    super(UserAccessGroupPermissionMap, dataSource)
    this.userAccessGroup = this.createBelongsToAccessorFor('userAccessGroup', userAccessGroupRepositoryGetter)
    this.registerInclusionResolver('userAccessGroup', this.userAccessGroup.inclusionResolver)

    this.permission = this.createBelongsToAccessorFor('permission', permissionRepositoryGetter)
    this.registerInclusionResolver('permission', this.permission.inclusionResolver)
  }
}


