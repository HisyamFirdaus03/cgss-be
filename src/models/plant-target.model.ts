import { Entity, model, property, belongsTo } from '@loopback/repository'
import { Plant } from './plant.model'

@model()
export class PlantTarget extends Entity {
  @property({
    type: 'number',
    required: true,
  })
  year: number

  @property({
    type: 'number',
    required: true,
  })
  target: number

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

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

  //relations
  @belongsTo(() => Plant) plantId: number

  constructor(data?: Partial<PlantTarget>) {
    super(data)
  }
}

export interface PlantTargetRelations {
  // describe navigational properties here
}

export type PlantTargetWithRelations = PlantTarget & PlantTargetRelations
