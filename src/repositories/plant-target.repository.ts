import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor, Where, Count } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { PlantTarget, PlantTargetRelations, Plant } from '../models'
import { PlantRepository } from '../repositories/plant.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class PlantTargetRepository extends DefaultCrudRepository<PlantTarget, typeof PlantTarget.prototype.id, PlantTargetRelations> {
  public readonly plant: BelongsToAccessor<Plant, typeof PlantTarget.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('PlantRepository') protected plantRepositoryGetter: Getter<PlantRepository>
  ) {
    super(PlantTarget, dataSource)
    this.plant = this.createBelongsToAccessorFor('plant', plantRepositoryGetter)
    this.registerInclusionResolver('plant', this.plant.inclusionResolver)
  }

  async updateById(id: number, data: PlantTarget): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.updateById(id, data)
  }

  async replaceById(id: number, data: PlantTarget): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.replaceById(id, data)
  }

  async updateAll(data: PlantTarget, option?: Where<PlantTarget>): Promise<Count> {
    data.updatedAt = new Date().toISOString()
    return super.updateAll(data, option)
  }
}
