import { inject, Getter, Constructor } from '@loopback/core'
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope3BusinessTravel,
  EmissionScope3BusinessTravelActivity,
  EmissionScope3BusinessTravelActivityRelations,
  EmissionScope3EmployeeCommuting,
  EmployeeRegistry,
} from '../models'
import {
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionFactorRepository,
  EmissionScope3BusinessTravelRepository,
  EmployeeRegistryRepository,
} from '../repositories'
import { DatabaseConfig } from '../configurations/secrets'

export class EmissionScope3BusinessTravelActivityRepository extends TimeStampRepositoryMixin<
  EmissionScope3BusinessTravelActivity,
  typeof EmissionScope3BusinessTravelActivity.prototype.id,
  Constructor<
    DefaultCrudRepository<
      EmissionScope3BusinessTravelActivity,
      typeof EmissionScope3BusinessTravelActivity.prototype.id,
      EmissionScope3BusinessTravelActivityRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly belongsTo: BelongsToAccessor<EmissionScope3BusinessTravel, typeof EmissionScope3BusinessTravelActivity.prototype.id>
  public readonly employeeRegistry: BelongsToAccessor<EmployeeRegistry, typeof EmissionScope3EmployeeCommuting.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionScope3BusinessTravelRepository')
    protected emissionScope3BusinessTravelRepository: Getter<EmissionScope3BusinessTravelRepository>,

    @repository.getter('EmployeeRegistryRepository')
    protected employeeRegistryGetter: Getter<EmployeeRegistryRepository>,

    @repository(EmissionFactorRepository)
    private emissionFactorRepository: EmissionFactorRepository
  ) {
    super(EmissionScope3BusinessTravelActivity, dataSource, userRepositoryGetter)

    this.belongsTo = this.createBelongsToAccessorFor('belongsTo', emissionScope3BusinessTravelRepository)
    this.registerInclusionResolver('belongsTo', this.belongsTo.inclusionResolver)

    this.employeeRegistry = this.createBelongsToAccessorFor('employeeRegistry', employeeRegistryGetter)
    this.registerInclusionResolver('employeeRegistry', this.employeeRegistry.inclusionResolver)
  }
}
