import { Configuration, ConfigurationRelations } from '../models'
import { inject, Getter, Constructor } from '@loopback/core'
import { DefaultCrudRepository, Filter, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { UserRepository, TimeStampRepositoryMixin } from '../repositories'
import { DatabaseConfig } from '../configurations/secrets'

export class ConfigurationRepository extends TimeStampRepositoryMixin<
  Configuration,
  typeof Configuration.prototype.id,
  Constructor<DefaultCrudRepository<Configuration,
    typeof Configuration.prototype.id,
    ConfigurationRelations
  >>
>(DefaultCrudRepository) {
  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Configuration, dataSource, userRepositoryGetter)
  }

  async findFirst(filter?: Filter<Configuration>) {
    const res = await this.find(filter)
    return res[0] ?? new Configuration()
  }
}
