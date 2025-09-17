import { inject, Getter } from '@loopback/core'
import { DefaultCrudRepository, repository, BelongsToAccessor, Where, Count } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { PlantGrowthRate, PlantGrowthRateRelations, Plant } from '../models'
import { PlantRepository } from '../repositories/plant.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class PlantGrowthRateRepository extends DefaultCrudRepository<
  PlantGrowthRate,
  typeof PlantGrowthRate.prototype.id,
  PlantGrowthRateRelations
> {
  public readonly plant: BelongsToAccessor<Plant, typeof PlantGrowthRate.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('PlantRepository') protected plantRepositoryGetter: Getter<PlantRepository>
  ) {
    super(PlantGrowthRate, dataSource)
    this.plant = this.createBelongsToAccessorFor('plant', plantRepositoryGetter)
    this.registerInclusionResolver('plant', this.plant.inclusionResolver)
  }

  async updateById(id: number, data: PlantGrowthRate): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.updateById(id, data)
  }

  async replaceById(id: number, data: PlantGrowthRate): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.replaceById(id, data)
  }

  async updateAll(data: PlantGrowthRate, option?: Where<PlantGrowthRate>): Promise<Count> {
    data.updatedAt = new Date().toISOString()
    return super.updateAll(data, option)
  }
}
