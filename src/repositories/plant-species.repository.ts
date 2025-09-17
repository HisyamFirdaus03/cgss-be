import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory, Where, Count } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { PlantSpecies, PlantSpeciesRelations, Plant, PlantActualDetail } from '../models'
import { PlantRepository } from '../repositories/plant.repository'
import { PlantActualDetailRepository } from '../repositories/plant-actual-detail.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class PlantSpeciesRepository extends DefaultCrudRepository<PlantSpecies, typeof PlantSpecies.prototype.id, PlantSpeciesRelations> {
  public readonly plant: BelongsToAccessor<Plant, typeof PlantSpecies.prototype.id>
  public readonly plantActualDetails: HasManyRepositoryFactory<PlantActualDetail, typeof PlantSpecies.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('PlantRepository')
    protected plantRepositoryGetter: Getter<PlantRepository>,

    @repository.getter('PlantActualDetailRepository')
    protected plantActualDetailRepositoryGetter: Getter<PlantActualDetailRepository>
  ) {
    super(PlantSpecies, dataSource)

    this.plant = this.createBelongsToAccessorFor('plant', plantRepositoryGetter)
    this.registerInclusionResolver('plant', this.plant.inclusionResolver)

    // prettier-ignore
    this.plantActualDetails = this.createHasManyRepositoryFactoryFor('plantActualDetails', plantActualDetailRepositoryGetter)
    this.registerInclusionResolver('plantActualDetails', this.plantActualDetails.inclusionResolver)
  }

  async updateById(id: number, data: PlantSpecies): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.updateById(id, data)
  }

  async replaceById(id: number, data: PlantSpecies): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.replaceById(id, data)
  }

  async updateAll(data: PlantSpecies, option?: Where<PlantSpecies>): Promise<Count> {
    data.updatedAt = new Date().toISOString()
    return super.updateAll(data, option)
  }
}
