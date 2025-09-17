import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionProduction,
  EmissionProductionActivity,
  EmissionProductionActivityRelations,
} from '../models'
import { UserRepository, EmissionProductionRepository, TimeStampRepositoryMixin } from '../repositories'
import { DatabaseConfig } from '../configurations/secrets'

export class EmissionProductionActivityRepository extends TimeStampRepositoryMixin<
  EmissionProductionActivity,
  typeof EmissionProductionActivity.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionProductionActivity,
      typeof EmissionProductionActivity.prototype.id,
      EmissionProductionActivityRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly belongsTo: BelongsToAccessor<EmissionProduction, typeof EmissionProductionActivity.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionProductionRepository')
    protected emissionProductionGetter: Getter<EmissionProductionRepository>
  ) {
    super(EmissionProductionActivity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionProductionGetter)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)
  }
}
