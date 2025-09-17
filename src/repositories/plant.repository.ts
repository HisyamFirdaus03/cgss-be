import { inject, Getter } from '@loopback/core'
import {
  DefaultCrudRepository,
  repository,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  Count,
  Where,
  BelongsToAccessor,
} from '@loopback/repository'
import { DemoDataSource } from '../datasources'
import { PlantUrlRepository } from './plant-url.repository'
import { PlantSpeciesRepository } from './plant-species.repository'
import { PlantGrowthRateRepository } from './plant-growth-rate.repository'
import { PlantActualRepository } from './plant-actual.repository'
import { PlantTargetRepository } from './plant-target.repository'
import { PlantCategoryRepository } from './plant-category.repository'
import { DatabaseConfig } from '../configurations/secrets'

import { Plant, PlantRelations, PlantUrl, PlantSpecies, PlantGrowthRate, PlantActual, PlantTarget, PlantCategory } from '../models'

export class PlantRepository extends DefaultCrudRepository<Plant, typeof Plant.prototype.id, PlantRelations> {
  public readonly plantGrowthRate: HasOneRepositoryFactory<PlantGrowthRate, typeof Plant.prototype.id>

  public readonly plantUrls: HasManyRepositoryFactory<PlantUrl, typeof Plant.prototype.id>
  public readonly plantSpecies: HasManyRepositoryFactory<PlantSpecies, typeof Plant.prototype.id>
  public readonly plantActuals: HasManyRepositoryFactory<PlantActual, typeof Plant.prototype.id>
  public readonly plantTargets: HasManyRepositoryFactory<PlantTarget, typeof Plant.prototype.id>
  public readonly plantCategory: BelongsToAccessor<PlantCategory, typeof Plant.prototype.id>

  constructor(
    @inject(DatabaseConfig.DATABASE_LB4_PATH) dataSource: DemoDataSource,
    @repository.getter('PlantUrlRepository')
    protected plantUrlRepositoryGetter: Getter<PlantUrlRepository>,

    @repository.getter('PlantSpeciesRepository')
    protected plantSpeciesRepositoryGetter: Getter<PlantSpeciesRepository>,

    @repository.getter('PlantGrowthRateRepository')
    protected plantGrowthRateRepositoryGetter: Getter<PlantGrowthRateRepository>,

    @repository.getter('PlantActualRepository')
    protected plantActualRepositoryGetter: Getter<PlantActualRepository>,

    @repository.getter('PlantTargetRepository')
    protected plantTargetRepositoryGetter: Getter<PlantTargetRepository>,

    @repository.getter('PlantCategoryRepository')
    protected plantCategoryRepositoryGetter: Getter<PlantCategoryRepository>
  ) {
    super(Plant, dataSource)

    this.plantTargets = this.createHasManyRepositoryFactoryFor('plantTargets', plantTargetRepositoryGetter)
    this.registerInclusionResolver('plantTargets', this.plantTargets.inclusionResolver)

    this.plantActuals = this.createHasManyRepositoryFactoryFor('plantActuals', plantActualRepositoryGetter)
    this.registerInclusionResolver('plantActuals', this.plantActuals.inclusionResolver)

    this.plantSpecies = this.createHasManyRepositoryFactoryFor('plantSpecies', plantSpeciesRepositoryGetter)
    this.registerInclusionResolver('plantSpecies', this.plantSpecies.inclusionResolver)

    this.plantUrls = this.createHasManyRepositoryFactoryFor('plantUrls', plantUrlRepositoryGetter)
    this.registerInclusionResolver('plantUrls', this.plantUrls.inclusionResolver)

    this.plantGrowthRate = this.createHasOneRepositoryFactoryFor('plantGrowthRate', plantGrowthRateRepositoryGetter)
    this.registerInclusionResolver('plantGrowthRate', this.plantGrowthRate.inclusionResolver)

    this.plantCategory = this.createBelongsToAccessorFor('plantCategory', plantCategoryRepositoryGetter)
    this.registerInclusionResolver('plantCategory', this.plantCategory.inclusionResolver)
  }

  async updateById(id: number, data: Plant): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.updateById(id, data)
  }

  async replaceById(id: number, data: Plant): Promise<void> {
    data.updatedAt = new Date().toISOString()
    return super.replaceById(id, data)
  }

  async updateAll(data: Plant, option?: Where<Plant>): Promise<Count> {
    data.updatedAt = new Date().toISOString()
    return super.updateAll(data, option)
  }
}
