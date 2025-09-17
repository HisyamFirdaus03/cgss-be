import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope1FugitiveEmission,
  EmissionScope1FugitiveEmissionActivity,
  EmissionScope1FugitiveEmissionActivityRelations,
} from '../models'
import { UserRepository, EmissionScope1FugitiveEmissionRepository, TimeStampRepositoryMixin } from '../repositories'
import { DatabaseConfig } from '../configurations/secrets'

export class EmissionScope1FugitiveEmissionActivityRepository extends TimeStampRepositoryMixin<
  EmissionScope1FugitiveEmissionActivity,
  typeof EmissionScope1FugitiveEmissionActivity.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope1FugitiveEmissionActivity,
      typeof EmissionScope1FugitiveEmissionActivity.prototype.id,
      EmissionScope1FugitiveEmissionActivityRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly belongsTo: BelongsToAccessor<EmissionScope1FugitiveEmission, typeof EmissionScope1FugitiveEmissionActivity.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionScope1FugitiveEmissionRepository')
    protected emissionScope1FugitiveEmissionGetter: Getter<EmissionScope1FugitiveEmissionRepository>
  ) {
    super(EmissionScope1FugitiveEmissionActivity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionScope1FugitiveEmissionGetter)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)
  }
}
