import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionProduction } from './emission-production.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: {
      where: { deletedId: null, deletedAt: null },
      order: 'date DESC',
    },
  },
})
export class EmissionProductionActivity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'number', required: true, dataType: 'double' }) input: number
  @property({ type: 'string', required: true }) desc: string

  @belongsTo(() => EmissionProduction, { name: 'belongsTo' }, { index: true })
  emissionProductionId: number

  constructor(data?: Partial<EmissionProductionActivity>) {
    super(data)
  }
}

export interface EmissionProductionActivityRelations {
  // describe navigational properties here
}

export type EmissionProductionActivityWithRelations = EmissionProductionActivity &
  EmissionProductionActivityRelations
