import { Entity, model, property, belongsTo } from '@loopback/repository'
import { Plant } from './plant.model'

@model()
export class PlantUrl extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({
    type: 'string',
    required: true,
  })
  url: string

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

  @belongsTo(() => Plant)
  plantId: number

  constructor(data?: Partial<PlantUrl>) {
    super(data)
  }
}

export interface PlantUrlRelations {
  // describe navigational properties here
}

export type PlantUrlWithRelations = PlantUrl & PlantUrlRelations
