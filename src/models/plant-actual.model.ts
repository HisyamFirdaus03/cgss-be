import { Entity, model, property, belongsTo, hasMany } from '@loopback/repository'
import { Plant } from './plant.model'
import { Enduser } from './enduser.model'
import { State } from './state.model'
import { PlantActualDetail } from './plant-actual-detail.model'

@model()
export class PlantActual extends Entity {
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
  status: string

  @property({
    type: 'date',
  })
  date_planted: Date

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
  @belongsTo(() => State) stateId: number
  @belongsTo(() => Enduser) enduserId: number

  @hasMany(() => PlantActualDetail) plantActualDetails: PlantActualDetail[]

  constructor(data?: Partial<PlantActual>) {
    super(data)
  }
}

export interface PlantActualRelations {
  // describe navigational properties here
}

export type PlantActualWithRelations = PlantActual & PlantActualRelations
