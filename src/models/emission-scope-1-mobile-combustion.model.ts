import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { MobileRegistry, GroupBy, EmissionScope1MobileCombustionActivity } from '../models'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope1MobileCombustion extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  // composite key
  @belongsTo(() => MobileRegistry, undefined, { index: true }) mobileRegistryId: number
  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number

  @hasMany(() => EmissionScope1MobileCombustionActivity, { keyTo: 'mobileCombustionId' })
  activities: EmissionScope1MobileCombustionActivity[]

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<EmissionScope1MobileCombustion>) {
    super(data)
  }
}

export interface EmissionScope1MobileCombustionRelations {
  // describe navigational properties here
  mobileRegistry: MobileRegistry
  groupBy: GroupBy
}

export type EmissionScope1MobileCombustionWithRelations = EmissionScope1MobileCombustion & EmissionScope1MobileCombustionRelations
