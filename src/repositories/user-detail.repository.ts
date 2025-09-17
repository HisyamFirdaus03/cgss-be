import { Getter, inject } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { User, UserDetail, UserDetailRelations } from '../models'
import { UserRepository } from './user.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class UserDetailRepository extends DefaultCrudRepository<UserDetail, typeof UserDetail.prototype.id, UserDetailRelations> {
  public readonly user: BelongsToAccessor<User, typeof UserDetail.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>
  ) {
    super(UserDetail, dataSource)
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter)
    this.registerInclusionResolver('user', this.user.inclusionResolver)
  }
}
