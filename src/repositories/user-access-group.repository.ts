import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, HasManyThroughRepositoryFactory } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { UserAccessGroup, UserAccessGroupRelations, User, UserAccessGroupMap, Permission, UserAccessGroupPermissionMap } from '../models'
import { UserAccessGroupMapRepository } from './user-access-group-map.repository'
import { UserRepository } from './user.repository'
import { DatabaseConfig } from '../configurations/secrets'
import { UserAccessGroupPermissionMapRepository } from './user-access-group-permission-map.repository'
import { PermissionRepository } from './permission.repository'

export class UserAccessGroupRepository extends DefaultCrudRepository<
  UserAccessGroup,
  typeof UserAccessGroup.prototype.id,
  UserAccessGroupRelations
> {
  public readonly users: HasManyThroughRepositoryFactory<
    User,
    typeof User.prototype.id,
    UserAccessGroupMap,
    typeof UserAccessGroup.prototype.id
  >

  public readonly permissions: HasManyThroughRepositoryFactory<
    Permission,
    typeof Permission.prototype.id,
    UserAccessGroupPermissionMap,
    typeof UserAccessGroup.prototype.id
  >

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('UserAccessGroupMapRepository')
    protected userAccessGroupMapRepositoryGetter: Getter<UserAccessGroupMapRepository>,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('UserAccessGroupPermissionMapRepository')
    protected uagPermMapRepoGetter: Getter<UserAccessGroupPermissionMapRepository>,
    @repository.getter('PermissionRepository') protected permissionRepoGetter: Getter<PermissionRepository>
  ) {
    super(UserAccessGroup, dataSource)
    this.users = this.createHasManyThroughRepositoryFactoryFor('users', userRepositoryGetter, userAccessGroupMapRepositoryGetter)
    this.registerInclusionResolver('users', this.users.inclusionResolver)

    this.permissions = this.createHasManyThroughRepositoryFactoryFor('permissions', permissionRepoGetter, uagPermMapRepoGetter)
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver)
  }
}
