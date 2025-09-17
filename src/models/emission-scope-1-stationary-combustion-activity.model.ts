import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope1StationaryCombustion } from './emission-scope-1-stationary-combustion.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: {
      where: { deletedId: null, deletedAt: null },
      order: 'date DESC',
    },
  },
})
export class EmissionScope1StationaryCombustionActivity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'number', required: true, dataType: 'double' }) input: number
  @property({ type: 'string', required: true }) desc: string

  @belongsTo(() => EmissionScope1StationaryCombustion, { name: 'belongsTo' }, { index: true }) stationaryCombustionId: number

  constructor(data?: Partial<EmissionScope1StationaryCombustionActivity>) {
    super(data)
  }
}

export interface EmissionScope1StationaryCombustionActivityRelations {
  // describe navigational properties here
}

export type EmissionScope1StationaryCombustionDataWithRelations = EmissionScope1StationaryCombustionActivity &
  EmissionScope1StationaryCombustionActivityRelations
