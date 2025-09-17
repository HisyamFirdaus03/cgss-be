import { Getter, inject } from '@loopback/core'
import { Count, DefaultCrudRepository, HasManyRepositoryFactory, repository, Where } from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { Plant, PlantCategory, PlantCategoryRelations } from '../models'
import { PlantRepository } from '../repositories/plant.repository'
import { DatabaseConfig } from '../configurations/secrets'

export class PlantCategoryRepository extends DefaultCrudRepository<
  PlantCategory,
  typeof PlantCategory.prototype.id,
  PlantCategoryRelations
> {
  public readonly plants: HasManyRepositoryFactory<Plant, typeof PlantCategory.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,

    @repository.getter('PlantRepository')
    protected plantRepositoryGetter: Getter<PlantRepository>
  ) {
    super(PlantCategory, dataSource)

    this.plants = this.createHasManyRepositoryFactoryFor('plants', this.plantRepositoryGetter)
    this.registerInclusionResolver('plants', this.plants.inclusionResolver)
  }

  async updateById(id: number, data: PlantCategory): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.updateById(id, data)
  }

  async replaceById(id: number, data: PlantCategory): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.replaceById(id, data)
  }

  async updateAll(data: PlantCategory, option?: Where<PlantCategory>): Promise<Count> {
    data.updatedAt = new Date().toISOString()
    return super.updateAll(data, option)
  }
}
