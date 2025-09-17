import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope3WasteGenerated } from '../models/emission-scope-3-waste-generated.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: {
      where: { deletedId: null, deletedAt: null },
      order: 'date DESC',
    },
  },
})
export class EmissionScope3WasteGeneratedActivity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true, index: true }) date: Date
  @property({ type: 'number', required: true, dataType: 'double' }) input: number
  @property({ type: 'string', required: true }) desc: string

  @belongsTo(() => EmissionScope3WasteGenerated, { name: 'belongsTo' }, { index: true }) wasteGeneratedId: number

  constructor(data?: Partial<EmissionScope3WasteGeneratedActivity>) {
    super(data)
  }
}

export interface EmissionScope3WasteGeneratedActivityRelations {
  // describe navigational properties here
}

export type EmissionScope3WasteGeneratedActivityWithRelations = EmissionScope3WasteGeneratedActivity &
  EmissionScope3WasteGeneratedActivityRelations
