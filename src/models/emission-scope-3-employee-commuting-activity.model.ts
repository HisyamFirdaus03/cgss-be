import { belongsTo, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope3EmployeeCommuting } from '../models/emission-scope-3-employee-commuting.model'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: {
      where: { deletedId: null, deletedAt: null },
      order: 'date DESC',
    },
  },
})
export class EmissionScope3EmployeeCommutingActivity extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'date', required: true }) date: Date
  @property({ type: 'number', required: true, dataType: 'double' }) input: number // EmployeeRegistry.avg_day_working_per_month
  @property({ type: 'string', required: true }) desc: string

  @property({ type: 'object', required: true })
  metadata: {
    addressFrom: string // usually home address, taken from EmployeeRegistry.address
    addressTo: string // usually home office address, taken from EmployeeRegistry.officeAddress

    distance: number // EmployeeRegistry.distance
    EF_MobileCombustionDistanceId: string // EmissionFactor > mobile_combustion > distance > id
  }

  @belongsTo(() => EmissionScope3EmployeeCommuting, { name: 'belongsTo' }, { index: true }) employeeCommutingId: number

  constructor(data?: Partial<EmissionScope3EmployeeCommutingActivity>) {
    super(data)
  }
}

export interface EmissionScope3EmployeeCommutingActivityRelations {
  // describe navigational properties here
}

export type EmissionScope3EmployeeCommutingDataWithRelations = EmissionScope3EmployeeCommutingActivity &
  EmissionScope3EmployeeCommutingActivityRelations
