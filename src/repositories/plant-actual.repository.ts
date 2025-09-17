import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory, Where, Count } from '@loopback/repository'

import { DemoDataSource } from '../datasources'
import { PlantRepository } from './plant.repository'
import { EnduserRepository } from './enduser.repository'
import { StateRepository } from './state.repository'
import { PlantActualDetailRepository } from './plant-actual-detail.repository'
import { PlantActual, PlantActualRelations, Plant, Enduser, State, PlantActualDetail } from '../models'
import { DatabaseConfig } from '../configurations/secrets'

export class PlantActualRepository extends DefaultCrudRepository<PlantActual, typeof PlantActual.prototype.id, PlantActualRelations> {
  public readonly plant: BelongsToAccessor<Plant, typeof PlantActual.prototype.id>
  public readonly enduser: BelongsToAccessor<Enduser, typeof PlantActual.prototype.id>
  public readonly state: BelongsToAccessor<State, typeof PlantActual.prototype.id>

  public readonly plantActualDetails: HasManyRepositoryFactory<PlantActualDetail, typeof PlantActual.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,

    @repository.getter('PlantRepository')
    protected plantRepositoryGetter: Getter<PlantRepository>,

    @repository.getter('EnduserRepository')
    protected enduserRepositoryGetter: Getter<EnduserRepository>,

    @repository.getter('StateRepository')
    protected stateRepositoryGetter: Getter<StateRepository>,

    @repository.getter('PlantActualDetailRepository')
    protected plantActualDetailRepositoryGetter: Getter<PlantActualDetailRepository>
  ) {
    super(PlantActual, dataSource)
    this.state = this.createBelongsToAccessorFor('state', stateRepositoryGetter)
    this.registerInclusionResolver('state', this.state.inclusionResolver)

    this.enduser = this.createBelongsToAccessorFor('enduser', enduserRepositoryGetter)
    this.registerInclusionResolver('enduser', this.enduser.inclusionResolver)

    this.plant = this.createBelongsToAccessorFor('plant', plantRepositoryGetter)
    this.registerInclusionResolver('plant', this.plant.inclusionResolver)

    // prettier-ignore
    this.plantActualDetails = this.createHasManyRepositoryFactoryFor('plantActualDetails', plantActualDetailRepositoryGetter)
    this.registerInclusionResolver('plantActualDetails', this.plantActualDetails.inclusionResolver)
  }

  async updateById(id: number, data: PlantActual): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.updateById(id, data)
  }

  async replaceById(id: number, data: PlantActual): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.replaceById(id, data)
  }

  async updateAll(data: PlantActual, option?: Where<PlantActual>): Promise<Count> {
    data.updatedAt = new Date().toISOString()
    return super.updateAll(data, option)
  }
}
