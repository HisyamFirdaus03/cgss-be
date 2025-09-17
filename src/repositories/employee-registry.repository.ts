import { inject, Getter, Constructor } from '@loopback/core'
import { DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import {
  EmissionScope3BusinessTravelActivity,
  EmissionScope3EmployeeCommuting,
  EmployeeRegistry,
  EmployeeRegistryRelations,
} from '../models'
import {
  UserRepository,
  TimeStampRepositoryMixin,
  EmissionScope3EmployeeCommutingRepository,
  EmissionScope3BusinessTravelActivityRepository,
} from '../repositories'
import { DatabaseConfig } from '../configurations/secrets'

export class EmployeeRegistryRepository extends TimeStampRepositoryMixin<
  EmployeeRegistry,
  typeof EmployeeRegistry.prototype.id,
  Constructor<DefaultCrudRepository<EmployeeRegistry, typeof EmployeeRegistry.prototype.id, EmployeeRegistryRelations>>
>(DefaultCrudRepository) {
  public readonly emissionScope3EmployeeCommuting: HasManyRepositoryFactory<
    EmissionScope3EmployeeCommuting,
    typeof EmployeeRegistry.prototype.id
  >

  public readonly emissionScope3BusinessTravelActivity: HasManyRepositoryFactory<
    EmissionScope3BusinessTravelActivity,
    typeof EmployeeRegistry.prototype.id
  >

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,
    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('EmissionScope3EmployeeCommutingRepository')
    protected emissionScope3EmployeeCommutingGetter: Getter<EmissionScope3EmployeeCommutingRepository>,
    @repository.getter('EmissionScope3BusinessTravelActivityRepository')
    protected emissionScope3BusinessTravelActivityGetter: Getter<EmissionScope3BusinessTravelActivityRepository>,
  ) {
    super(EmployeeRegistry, dataSource, userRepositoryGetter)

    // prettier-ignore
    this.emissionScope3EmployeeCommuting = this.createHasManyRepositoryFactoryFor('emissionScope3EmployeeCommuting', emissionScope3EmployeeCommutingGetter)
    this.registerInclusionResolver('emissionScope3EmployeeCommuting', this.emissionScope3EmployeeCommuting.inclusionResolver)

    // prettier-ignore
    this.emissionScope3BusinessTravelActivity = this.createHasManyRepositoryFactoryFor('emissionScope3BusinessTravelActivity', emissionScope3BusinessTravelActivityGetter)
    this.registerInclusionResolver('emissionScope3BusinessTravelActivity', this.emissionScope3BusinessTravelActivity.inclusionResolver)
  }


  /// when someone delete employee registry then delete employee commuting instance
  // consider whether if we delete, then the whole co2e data gone.
}
