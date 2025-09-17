import { hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'

import {
  EmissionScope1StationaryCombustion,
  EmissionScope1StationaryCombustionWithRelations,
  EmissionScope1FugitiveEmission,
  EmissionScope1FugitiveEmissionWithRelations,
  EmissionScope1MobileCombustion,
  EmissionScope1MobileCombustionWithRelations,
  EmissionScope1ProcessEmission,
  EmissionScope1ProcessEmissionWithRelations,
  EmissionScope2,
  EmissionScope2WithRelations,
  EmissionScope3EmployeeCommuting,
  EmissionScope3EmployeeCommutingWithRelations,
  EmissionScope3BusinessTravel,
  EmissionScope3UpstreamDownstreamTransportationAndDistribution,
  EmissionProduction, EmissionScope3WasteGenerated, EmissionScope3WasteGeneratedWithRelations,
} from '../models'

@model({
  settings: {
    scope: { order: 'name asc' },
    hiddenProperties: ['createdAt', 'createdId', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
  },
})
export class GroupBy extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'string', required: true, index: { unique: true } })
  name: string

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  @hasMany(() => EmissionScope1FugitiveEmission) emissionScope1FugitiveEmissions: EmissionScope1FugitiveEmissionWithRelations[]
  @hasMany(() => EmissionScope1MobileCombustion) emissionScope1MobileCombustions: EmissionScope1MobileCombustionWithRelations[]
  @hasMany(() => EmissionScope1ProcessEmission) emissionScope1ProcessEmissions: EmissionScope1ProcessEmissionWithRelations[]
  @hasMany(() => EmissionScope1StationaryCombustion) emissionScope1StationaryCombustions: EmissionScope1StationaryCombustionWithRelations[]

  @hasMany(() => EmissionScope2) emissionScope2s: EmissionScope2WithRelations[]

  @hasMany(() => EmissionScope3EmployeeCommuting) emissionScope3EmployeeCommuting: EmissionScope3EmployeeCommutingWithRelations[]
  @hasMany(() => EmissionScope3BusinessTravel) emissionScope3BusinessTravels: EmissionScope3BusinessTravel[]
  @hasMany(() => EmissionScope3UpstreamDownstreamTransportationAndDistribution) emissionScope3Udtds: EmissionScope3UpstreamDownstreamTransportationAndDistribution[] // prettier-ignore
  @hasMany(() => EmissionScope3WasteGenerated) emissionScope3WasteGenerated: EmissionScope3WasteGeneratedWithRelations[] // prettier-ignore

  @hasMany(() => EmissionProduction) emissionProductions: EmissionProduction[]

  constructor(data?: Partial<GroupBy>) {
    super(data)
  }
}

export interface GroupByRelations {
  // describe navigational properties here
  emissionScope1FugitiveEmissions: EmissionScope1FugitiveEmissionWithRelations[]
  emissionScope1MobileCombustions: EmissionScope1MobileCombustionWithRelations[]
  emissionScope1ProcessEmissions: EmissionScope1ProcessEmissionWithRelations[]
  emissionScope1StationaryCombustions: EmissionScope1StationaryCombustionWithRelations[]
  emissionScope2s: EmissionScope2WithRelations[]
  emissionScope3EmployeeCommuting: EmissionScope3EmployeeCommutingWithRelations[]
  emissionScope3BusinessTravels: EmissionScope3BusinessTravel[]
  emissionScope3Udtds: EmissionScope3UpstreamDownstreamTransportationAndDistribution[]
  emissionScope3WasteGenerated: EmissionScope3WasteGeneratedWithRelations[]

  emissionProductions: EmissionProduction[]
}

export type GroupByWithRelations = GroupBy & GroupByRelations
