import { Entity, model, property, belongsTo } from '@loopback/repository'
import { PlantActual } from './plant-actual.model'
import { PlantSpecies } from './plant-species.model'

@model()
export class PlantActualDetail extends Entity {
  @property({
    type: 'number',
    required: true,
  })
  no_of_seedling: number

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({
    type: 'number',
    required: true,
  })
  height: number

  @property({
    type: 'number',
    required: true,
  })
  geo_coverage: number

  @property({
    type: 'number',
    required: true,
    dataType: 'double',
  })
  latitude: number

  @property({
    type: 'number',
    required: true,
    dataType: 'double',
  })
  longitude: number

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

  @belongsTo(() => PlantActual) plantActualId: number
  @belongsTo(() => PlantSpecies) plantSpeciesId: number

  constructor(data?: Partial<PlantActualDetail>) {
    super(data)
  }
}

export interface PlantActualDetailRelations {
  // describe navigational properties here
}

export type PlantActualDetailWithRelations = PlantActualDetail & PlantActualDetailRelations
