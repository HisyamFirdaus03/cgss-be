import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope1ProcessEmission,
  EmissionScope1ProcessEmissionActivity,
  EmissionScope1ProcessEmissionActivityRelations,
} from '../models'
import { UserRepository, EmissionScope1ProcessEmissionRepository, TimeStampRepositoryMixin } from '../repositories'
import { DatabaseConfig } from '../configurations/secrets'

export class EmissionScope1ProcessEmissionActivityRepository extends TimeStampRepositoryMixin<
  EmissionScope1ProcessEmissionActivity,
  typeof EmissionScope1ProcessEmissionActivity.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope1ProcessEmissionActivity,
      typeof EmissionScope1ProcessEmissionActivity.prototype.id,
      EmissionScope1ProcessEmissionActivityRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly belongsTo: BelongsToAccessor<EmissionScope1ProcessEmission, typeof EmissionScope1ProcessEmissionActivity.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionScope1ProcessEmissionRepository')
    protected emissionScope1ProcessEmissionGetter: Getter<EmissionScope1ProcessEmissionRepository>
  ) {
    super(EmissionScope1ProcessEmissionActivity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionScope1ProcessEmissionGetter)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)
  }
}
