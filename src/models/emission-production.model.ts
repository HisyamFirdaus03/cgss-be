import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { GroupBy } from './group-by.model'
import { EmissionProductionActivity } from './emission-production-activity.model'

@model({
  settings: {
    hiddenProperties: ['createdAt', 'createdId', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionProduction extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number
  @property({ type: 'string', required: true }) category: string

  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number
  @hasMany(() => EmissionProductionActivity, { keyTo: 'emissionProductionId' }) activities: EmissionProductionActivity[]

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<EmissionProduction>) {
    super(data)
  }
}

export interface EmissionProductionRelations {
  // describe navigational properties here
  groupBy: GroupBy
}

export type EmissionProductionWithRelations = EmissionProduction & EmissionProductionRelations
