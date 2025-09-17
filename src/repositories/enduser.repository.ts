import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, HasManyRepositoryFactory } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { Enduser, EnduserRelations, PlantActual } from '../models'
import { PlantActualRepository } from './plant-actual.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class EnduserRepository extends DefaultCrudRepository<Enduser, typeof Enduser.prototype.id, EnduserRelations> {
  public readonly plantActuals: HasManyRepositoryFactory<PlantActual, typeof Enduser.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,

    @repository.getter('PlantActualRepository')
    protected plantActualRepositoryGetter: Getter<PlantActualRepository>
  ) {
    super(Enduser, dataSource)

    this.plantActuals = this.createHasManyRepositoryFactoryFor('plantActuals', plantActualRepositoryGetter)
    this.registerInclusionResolver('plantActuals', this.plantActuals.inclusionResolver)
  }
}
