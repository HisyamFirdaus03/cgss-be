import { Entity, model, property, belongsTo } from '@loopback/repository'
import { Plant } from './plant.model'

@model()
export class PlantGrowthRate extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({
    type: 'array',
    itemType: 'object',
    dataType: 'MEDIUMTEXT',
  })
  details?: {
    dbh: number
    height: number
    carbon_stock: number
    total_co2_absorption: number
  }[]

  @property({
    type: 'number',
    dataType: 'double',
    default: () => 0,
  })
  avg_co2_absorption?: number

  @property({
    type: 'number',
    dataType: 'double',
    default: () => 0,
  })
  carbon_fraction?: number

  @property({
    type: 'number',
    dataType: 'double',
    default: () => 0,
  })
  ratio?: number

  @property({ type: 'string', default: () => 'yearly-growth-rate' }) // or average-co2-absorption
  approach: string

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

  @belongsTo(() => Plant) plantId: number

  constructor(data?: Partial<PlantGrowthRate>) {
    super(data)
  }
}

export interface PlantGrowthRateRelations {
  // describe navigational properties here
}

export type PlantGrowthRateWithRelations = PlantGrowthRate & PlantGrowthRateRelations
