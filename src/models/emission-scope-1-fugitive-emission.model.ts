import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { GroupBy } from './group-by.model'
import { EmissionScope1FugitiveEmissionActivity } from '../models/emission-scope-1-fugitive-emission-activity.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope1FugitiveEmission extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number
  @property({ type: 'string', required: true }) category: string

  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number
  @hasMany(() => EmissionScope1FugitiveEmissionActivity, { keyTo: 'fugitiveEmissionId' })
  activities: EmissionScope1FugitiveEmissionActivity[]

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<EmissionScope1FugitiveEmission>) {
    super(data)
  }
}

export interface EmissionScope1FugitiveEmissionRelations {
  // describe navigational properties here
  groupBy: GroupBy
}

export type EmissionScope1FugitiveEmissionWithRelations = EmissionScope1FugitiveEmission & EmissionScope1FugitiveEmissionRelations
