import { Entity, model, property, belongsTo, hasMany } from '@loopback/repository'
import { Plant } from './plant.model'
import { PlantActualDetail } from './plant-actual-detail.model'

@model()
export class PlantSpecies extends Entity {
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
  species_name: string

  @property({
    type: 'string',
    required: true,
  })
  local_name: string

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
  @belongsTo(() => Plant) plantId: number
  @hasMany(() => PlantActualDetail) plantActualDetails: PlantActualDetail[]

  constructor(data?: Partial<PlantSpecies>) {
    super(data)
  }
}

export interface PlantSpeciesRelations {
  // describe navigational properties here
}

export type PlantSpeciesWithRelations = PlantSpecies & PlantSpeciesRelations
