import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor, Where, Count } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { PlantActualDetail, PlantActualDetailRelations, PlantActual, PlantSpecies } from '../models'
import { PlantActualRepository } from '../repositories/plant-actual.repository'
import { PlantSpeciesRepository } from '../repositories/plant-species.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class PlantActualDetailRepository extends DefaultCrudRepository<
  PlantActualDetail,
  typeof PlantActualDetail.prototype.id,
  PlantActualDetailRelations
> {
  public readonly plantActual: BelongsToAccessor<PlantActual, typeof PlantActualDetail.prototype.id>
  public readonly plantSpecies: BelongsToAccessor<PlantSpecies, typeof PlantActualDetail.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('PlantActualRepository') protected plantActualRepositoryGetter: Getter<PlantActualRepository>,
    @repository.getter('PlantSpeciesRepository') protected plantSpeciesRepositoryGetter: Getter<PlantSpeciesRepository>
  ) {
    super(PlantActualDetail, dataSource)

    this.plantSpecies = this.createBelongsToAccessorFor('plantSpecies', plantSpeciesRepositoryGetter)
    this.registerInclusionResolver('plantSpecies', this.plantSpecies.inclusionResolver)

    this.plantActual = this.createBelongsToAccessorFor('plantActual', plantActualRepositoryGetter)
    this.registerInclusionResolver('plantActual', this.plantActual.inclusionResolver)
  }

  async updateById(id: number, data: PlantActualDetail): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.updateById(id, data)
  }

  async replaceById(id: number, data: PlantActualDetail): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.replaceById(id, data)
  }

  async updateAll(data: PlantActualDetail, option?: Where<PlantActualDetail>): Promise<Count> {
    data.updatedAt = new Date().toISOString()
    return super.updateAll(data, option)
  }
}
