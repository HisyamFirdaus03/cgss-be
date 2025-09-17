import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope1ProcessEmission } from './emission-scope-1-process-emission.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: {
      where: { deletedId: null, deletedAt: null },
      order: 'date DESC',
    },
  },
})
export class EmissionScope1ProcessEmissionActivity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'number', required: true, dataType: 'double' }) input: number
  @property({ type: 'string', required: true }) desc: string

  @belongsTo(() => EmissionScope1ProcessEmission, { name: 'belongsTo' }, { index: true }) processEmissionId: number

  constructor(data?: Partial<EmissionScope1ProcessEmissionActivity>) {
    super(data)
  }
}

export interface EmissionScope1ProcessEmissionActivityRelations {
  // describe navigational properties here
  belongsTo?: EmissionScope1ProcessEmission
}

export type EmissionScope1ProcessEmissionActivityWithRelations = EmissionScope1ProcessEmissionActivity &
  EmissionScope1ProcessEmissionActivityRelations
