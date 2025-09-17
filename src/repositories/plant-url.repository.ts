import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor, Where, Count } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { PlantUrl, PlantUrlRelations, Plant } from '../models'
import { PlantRepository } from '../repositories/plant.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class PlantUrlRepository extends DefaultCrudRepository<PlantUrl, typeof PlantUrl.prototype.id, PlantUrlRelations> {
  public readonly plant: BelongsToAccessor<Plant, typeof PlantUrl.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('PlantRepository') protected plantRepositoryGetter: Getter<PlantRepository>
  ) {
    super(PlantUrl, dataSource)
    this.plant = this.createBelongsToAccessorFor('plant', plantRepositoryGetter)
    this.registerInclusionResolver('plant', this.plant.inclusionResolver)
  }

  async updateById(id: number, data: PlantUrl): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.updateById(id, data)
  }

  async replaceById(id: number, data: PlantUrl): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.replaceById(id, data)
  }

  async updateAll(data: PlantUrl, option?: Where<PlantUrl>): Promise<Count> {
    data.updatedAt = new Date().toISOString()
    return super.updateAll(data, option)
  }
}
