import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope2 } from '../models/emission-scope-2.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: {
      where: { deletedId: null, deletedAt: null },
      order: 'date DESC',
    },
  },
})
export class EmissionScope2Activity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'number', required: true, dataType: 'double' }) input: number
  @property({ type: 'string', required: true }) desc: string

  @belongsTo(() => EmissionScope2, { name: 'belongsTo' }, { index: true }) scope2Id: number

  constructor(data?: Partial<EmissionScope2Activity>) {
    super(data)
  }
}

export interface EmissionScope2ActivityRelations {
  // describe navigational properties here
}

export type EmissionScope2ActivityWithRelations = EmissionScope2Activity & EmissionScope2ActivityRelations
