import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope1MobileCombustion } from './emission-scope-1-mobile-combustion.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: {
      where: { deletedId: null, deletedAt: null },
      order: 'date DESC',
    },
  },
})
export class EmissionScope1MobileCombustionActivity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'number', required: true, dataType: 'double' }) input: number
  @property({ type: 'string', required: true }) desc: string
  @property({ type: 'string', required: true, jsonSchema: { enum: ['litre', 'distance'] } }) type: 'litre' | 'distance'

  @belongsTo(() => EmissionScope1MobileCombustion, { name: 'belongsTo' }, { index: true }) mobileCombustionId: number

  constructor(data?: Partial<EmissionScope1MobileCombustionActivity>) {
    super(data)
  }
}

export interface EmissionScope1MobileCombustionActivityRelations {
  // describe navigational properties here
}

export type EmissionScope1MobileCombustionDataWithRelations = EmissionScope1MobileCombustionActivity &
  EmissionScope1MobileCombustionActivityRelations
