import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope3BusinessTravel } from './emission-scope-3-business-travel.model'
import { EmployeeRegistry } from '../models/employee-registry.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope3BusinessTravelActivity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @belongsTo(() => EmployeeRegistry, undefined, { index: true }) employeeRegistryId: number

  @property({ type: 'object', required: true })
  logs: {
    addressFrom: string // usually home address, taken from EmployeeRegistry.address
    addressTo: string
    type: 'distance' | 'litre'
    input: number
    EF_MobileCombustionDistanceId: string // EmissionFactor > mobile_combustion > distance > id
  }[]

  @belongsTo(() => EmissionScope3BusinessTravel, { name: 'belongsTo' }, { index: true }) businessTravelId: number

  constructor(data?: Partial<EmissionScope3BusinessTravelActivity>) {
    super(data)
  }
}

export interface EmissionScope3BusinessTravelActivityRelations {
  // describe navigational properties here
  employeeRegistry: EmployeeRegistry
}

export type EmissionScope3BusinessTravelDataWithRelations = EmissionScope3BusinessTravelActivity &
  EmissionScope3BusinessTravelActivityRelations
