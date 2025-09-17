import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { UserAccessGroupMap, UserAccessGroupMapRelations, User, UserAccessGroup } from '../models'
import { DatabaseConfig } from '../configurations/secrets'
import { UserRepository } from './user.repository'
import { UserAccessGroupRepository } from './user-access-group.repository'

export class UserAccessGroupMapRepository extends DefaultCrudRepository<
  UserAccessGroupMap,
  typeof UserAccessGroupMap.prototype.id,
  UserAccessGroupMapRelations
> {
  public readonly user: BelongsToAccessor<User, typeof UserAccessGroupMap.prototype.id>
  public readonly userAccessGroup: BelongsToAccessor<UserAccessGroup, typeof UserAccessGroupMap.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('UserAccessGroupRepository') protected userAccessGroupRepositoryGetter: Getter<UserAccessGroupRepository>,
  ) {
    super(UserAccessGroupMap, dataSource)
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter)
    this.registerInclusionResolver('user', this.user.inclusionResolver)

    this.userAccessGroup = this.createBelongsToAccessorFor('userAccessGroup', userAccessGroupRepositoryGetter)
    this.registerInclusionResolver('userAccessGroup', this.userAccessGroup.inclusionResolver)
  }
}
