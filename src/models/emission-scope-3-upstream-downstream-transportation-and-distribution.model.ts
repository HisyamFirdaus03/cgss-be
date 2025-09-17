import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { GroupBy } from '../models'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope3UpstreamDownstreamTransportationAndDistribution extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'string', required: true }) name: string
  @property({ type: 'string' }) desc: string
  @property({
    index: true,
    type: 'string',
    required: true,
    jsonSchema: { enum: ['upstream', 'downstream'] },
  })
  type: 'upstream' | 'downstream'

  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number

  @property({ type: 'object', required: true })
  metadata: {
    addressFrom: string
    addressTo: string

    distance: number
    EF_MobileCombustionDistanceId: string
  }

  constructor(data?: Partial<EmissionScope3UpstreamDownstreamTransportationAndDistribution>) {
    super(data)
  }
}

export interface EmissionScope3UpstreamDownstreamTransportationAndDistributionRelations {
  groupBy: GroupBy
}

export type EmissionScope3UpstreamDownstreamTransportationAndDistributionWithRelations =
  EmissionScope3UpstreamDownstreamTransportationAndDistribution & EmissionScope3UpstreamDownstreamTransportationAndDistributionRelations
