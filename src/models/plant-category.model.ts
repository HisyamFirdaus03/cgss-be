import { Entity, hasMany, model, property } from '@loopback/repository'
import { Plant } from './plant.model'

@model()
export class PlantCategory extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({
    type: 'string',
    index: { unique: true },
  })
  name?: string

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

  // Define well-known properties here
  @hasMany(() => Plant) plants: Plant[];

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any

  constructor(data?: Partial<PlantCategory>) {
    super(data)
  }
}

export interface PlantCategoryRelations {
  // describe navigational properties here
}

export type PlantCategoryWithRelations = PlantCategory & PlantCategoryRelations
