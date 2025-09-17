import { Getter, inject } from '@loopback/core'
import { DefaultCrudRepository, HasManyRepositoryFactory, repository } from '@loopback/repository'
import { DemoDataSource } from '../datasources'

import { State, StateRelations, PlantActual } from '../models'
import { PlantActualRepository } from '../repositories/plant-actual.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class StateRepository extends DefaultCrudRepository<State, typeof State.prototype.id, StateRelations> {
  public readonly plantActuals: HasManyRepositoryFactory<PlantActual, typeof State.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('PlantActualRepository')
    protected plantActualRepositoryGetter: Getter<PlantActualRepository>
  ) {
    super(State, dataSource)
    this.plantActuals = this.createHasManyRepositoryFactoryFor('plantActuals', plantActualRepositoryGetter)
    this.registerInclusionResolver('plantActuals', this.plantActuals.inclusionResolver)
  }
}
