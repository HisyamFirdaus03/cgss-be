import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { GroupBy } from './group-by.model'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope2Activity } from '../models/emission-scope-2-activity.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope2 extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  // composite key (3 cols)
  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number
  @property({ type: 'string' }) category: string
  @property({
    type: 'string',
    required: true,
    jsonSchema: { enum: ['electric', 'steam', 'heat', 'cooling'] },
  })
  type: 'electric' | 'steam' | 'heat' | 'cooling'

  @property({
    type: 'string',
    required: false,
    jsonSchema: { enum: ['peninsular', 'sabah', 'sarawak'] },
  })
  location: 'peninsular' | 'sabah' | 'sarawak' // this will be used in when type is electric only

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  @hasMany(() => EmissionScope2Activity, { keyTo: 'scope2Id' })
  activities: EmissionScope2Activity[]

  constructor(data?: Partial<EmissionScope2>) {
    super(data)
  }
}

export interface EmissionScope2Relations {
  // describe navigational properties here
  groupBy: GroupBy
}

export type EmissionScope2WithRelations = EmissionScope2 & EmissionScope2Relations
