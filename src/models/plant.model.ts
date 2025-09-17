import { Entity, model, property, hasMany, hasOne, belongsTo } from '@loopback/repository'
import { PlantUrl } from './plant-url.model'
import { PlantSpecies } from './plant-species.model'
import { PlantGrowthRate } from './plant-growth-rate.model'
import { PlantActual } from './plant-actual.model'
import { PlantTarget } from './plant-target.model'
import { PlantCategory } from './plant-category.model'

@model()
export class Plant extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number

  @property({
    type: 'string',
    required: true,
    index: { unique: true },
  })
  name: string

  @property({
    type: 'string',
  })
  icon_path?: string

  @property({
    type: 'boolean',
    default: true,
  })
  is_active?: boolean

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: string

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: string

  // relations
  @belongsTo(() => PlantCategory) plantCategoryId: number
  @hasOne(() => PlantGrowthRate) plantGrowthRate: PlantGrowthRate

  @hasMany(() => PlantUrl) plantUrls: PlantUrl[]
  @hasMany(() => PlantActual) plantActuals: PlantActual[]
  @hasMany(() => PlantTarget) plantTargets: PlantTarget[]
  @hasMany(() => PlantSpecies) plantSpecies: PlantSpecies[]

  constructor(data?: Partial<Plant>) {
    super(data)
  }
}

export interface PlantRelations {
  // describe navigational properties here
}

export type PlantWithRelations = Plant & PlantRelations
