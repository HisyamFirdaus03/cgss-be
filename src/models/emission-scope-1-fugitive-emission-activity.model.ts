import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope1FugitiveEmission } from './emission-scope-1-fugitive-emission.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: {
      where: { deletedId: null, deletedAt: null },
      order: 'date DESC',
    },
  },
})
export class EmissionScope1FugitiveEmissionActivity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'number', required: true, dataType: 'double' }) input: number
  @property({ type: 'string', required: true }) desc: string

  @belongsTo(() => EmissionScope1FugitiveEmission, { name: 'belongsTo' }, { index: true }) fugitiveEmissionId: number

  constructor(data?: Partial<EmissionScope1FugitiveEmissionActivity>) {
    super(data)
  }
}

export interface EmissionScope1FugitiveEmissionActivityRelations {
  // describe navigational properties here
}

export type EmissionScope1FugitiveEmissionActivityWithRelations = EmissionScope1FugitiveEmissionActivity &
  EmissionScope1FugitiveEmissionActivityRelations
