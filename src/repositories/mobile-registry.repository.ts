import { inject, Getter, Constructor } from '@loopback/core'
import { DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { EmissionScope1MobileCombustion, MobileRegistry, MobileRegistryRelations } from '../models'
import { EmissionScope1MobileCombustionRepository, UserRepository, TimeStampRepositoryMixin } from '../repositories'
import { DatabaseConfig } from '../configurations/secrets'

export class MobileRegistryRepository extends TimeStampRepositoryMixin<
  MobileRegistry,
  typeof MobileRegistry.prototype.id,
  Constructor<DefaultCrudRepository<MobileRegistry, typeof MobileRegistry.prototype.id, MobileRegistryRelations>>
>(DefaultCrudRepository) {
  public readonly emissionScope1MobileCombustions: HasManyRepositoryFactory<
    EmissionScope1MobileCombustion,
    typeof MobileRegistry.prototype.id
  >

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH)
    dataSource: DemoDataSource,

    @repository.getter('UserRepository')
    userRepositoryGetter: Getter<UserRepository>,

    @repository.getter('EmissionScope1MobileCombustionRepository')
    protected emissionScope1MobileCombustionGetter: Getter<EmissionScope1MobileCombustionRepository>
  ) {
    super(MobileRegistry, dataSource, userRepositoryGetter)

    // prettier-ignore
    this.emissionScope1MobileCombustions = this.createHasManyRepositoryFactoryFor('emissionScope1MobileCombustions', emissionScope1MobileCombustionGetter)
    this.registerInclusionResolver('emissionScope1MobileCombustions', this.emissionScope1MobileCombustions.inclusionResolver)
  }
}
