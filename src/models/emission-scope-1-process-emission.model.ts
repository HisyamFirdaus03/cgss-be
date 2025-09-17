import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { GroupBy } from './group-by.model'
import { EmissionScope1ProcessEmissionActivity } from '../models/emission-scope-1-process-emission-activity.model'

@model({
  settings: {
    hiddenProperties: ['createdAt', 'createdId', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope1ProcessEmission extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number
  @property({ type: 'string', required: true }) category: string

  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number
  @hasMany(() => EmissionScope1ProcessEmissionActivity, { keyTo: 'processEmissionId' }) activities: EmissionScope1ProcessEmissionActivity[]

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<EmissionScope1ProcessEmission>) {
    super(data)
  }
}

export interface EmissionScope1ProcessEmissionRelations {
  // describe navigational properties here
  groupBy: GroupBy
}

export type EmissionScope1ProcessEmissionWithRelations = EmissionScope1ProcessEmission & EmissionScope1ProcessEmissionRelations
