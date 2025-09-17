import { Getter, inject } from '@loopback/core'
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { User, UserAccessGroup, UserAccessGroupMap, UserDetail, UserRelations } from '../models'
import { UserAccessGroupMapRepository } from './user-access-group-map.repository'
import { UserAccessGroupRepository } from './user-access-group.repository'
import { UserDetailRepository } from './user-detail.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class UserRepository extends DefaultCrudRepository<User, typeof User.prototype.id, UserRelations> {
  public readonly userDetail: HasOneRepositoryFactory<UserDetail, typeof User.prototype.id>
  public readonly user: BelongsToAccessor<User, typeof UserDetail.prototype.id>

  public readonly userAccessGroups: HasManyThroughRepositoryFactory<UserAccessGroup, typeof UserAccessGroup.prototype.id, UserAccessGroupMap, typeof User.prototype.id> // prettier-ignore

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('UserDetailRepository') protected userDetailRepositoryGetter: Getter<UserDetailRepository>,
    @repository.getter('UserAccessGroupRepository') protected userAccessGroupRepositoryGetter: Getter<UserAccessGroupRepository>, // prettier-ignore
    @repository.getter('UserAccessGroupMapRepository') protected userAccessGroupMapRepositoryGetter: Getter<UserAccessGroupMapRepository> // prettier-ignore
  ) {
    super(User, dataSource)

    this.userDetail = this.createHasOneRepositoryFactoryFor('userDetail', userDetailRepositoryGetter)
    this.registerInclusionResolver('userDetail', this.userDetail.inclusionResolver)

    this.userAccessGroups = this.createHasManyThroughRepositoryFactoryFor('userAccessGroups', userAccessGroupRepositoryGetter, userAccessGroupMapRepositoryGetter) // prettier-ignore
    this.registerInclusionResolver('userAccessGroups', this.userAccessGroups.inclusionResolver)
  }
}
