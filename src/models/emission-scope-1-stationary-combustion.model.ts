import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { GroupBy } from './group-by.model'
import { EmissionScope1StationaryCombustionActivity } from '../models/emission-scope-1-stationary-combustion-activity.model'

@model({
  settings: {
    hiddenProperties: ['createdAt', 'createdId', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope1StationaryCombustion extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number
  @property({ type: 'string', required: true }) typeId: string // FK, this will be using id in EmissionFactor.StationaryCombustion table and will grab hhv, co2, ...

  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number
  @hasMany(() => EmissionScope1StationaryCombustionActivity, { keyTo: 'stationaryCombustionId' })
  activities: EmissionScope1StationaryCombustionActivity[]

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<EmissionScope1StationaryCombustion>) {
    super(data)
  }
}

export interface EmissionScope1StationaryCombustionRelations {
  // describe navigational properties here
  groupBy: GroupBy
}

export type EmissionScope1StationaryCombustionWithRelations = EmissionScope1StationaryCombustion &
  EmissionScope1StationaryCombustionRelations
