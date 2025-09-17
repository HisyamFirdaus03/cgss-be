import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { GroupBy, EmissionScope3BusinessTravelActivity } from '../models'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope3BusinessTravel extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'string', required: true }) purpose: string
  @property({ type: 'string' }) desc: string
  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number

  @hasMany(() => EmissionScope3BusinessTravelActivity, { keyTo: 'businessTravelId' }) travelers: EmissionScope3BusinessTravelActivity[]

  constructor(data?: Partial<EmissionScope3BusinessTravel>) {
    super(data)
  }
}

export interface EmissionScope3BusinessTravelRelations {
  // describe navigational properties here
  groupBy: GroupBy
}

export type EmissionScope3BusinessTravelWithRelations = EmissionScope3BusinessTravel & EmissionScope3BusinessTravelRelations
