import { hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope3EmployeeCommuting } from '../models/emission-scope-3-employee-commuting.model'
import { EmissionScope3BusinessTravelActivity } from '../models/emission-scope-3-business-travel-activity.model'

@model({
  settings: {
    scope: { order: 'name asc' },
    hiddenProperties: ['createdAt', 'createdId', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
  },
})
export class EmployeeRegistry extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  @property({ type: 'string', required: true }) name: string
  @property({ type: 'string' }) staffId: string
  @property({ type: 'string', required: true }) addressFrom: string
  @property({ type: 'string', required: true }) addressTo: string
  @property({ type: 'number', required: true }) distance: number // (km), will be calculated from google map api/manually key-in
  @property({ type: 'number', required: true }) avg_day_working_per_month: number

  // this will be id that ref EmissionFactor > mobile_combustion > distance > id
  @property({ type: 'string', required: true }) EF_MobileCombustionDistanceId: string

  /*
   every time cron-job will set
   avg_day_working_per_month = EmissionScope3EmployeeCommutingActivity.input
   desc = 'cron job at start of month'
   EmissionScope3EmployeeCommutingActivity.metadata = {
     // just for display
     address, officeAddress,

     // calc co2e
     distance, EF_MobileCombustionDistanceId, avg_day_working_per_month
   }
   */

  @hasMany(() => EmissionScope3EmployeeCommuting) emissionScope3EmployeeCommuting: EmissionScope3EmployeeCommuting[]
  @hasMany(() => EmissionScope3BusinessTravelActivity) emissionScope3BusinessTravelActivity: EmissionScope3BusinessTravelActivity[]

  // if inactive, then don't show in dropdown.
  // previous employee selected will remain as is
  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<EmployeeRegistry>) {
    super(data)
  }
}

export interface EmployeeRegistryRelations {
  // describe navigational properties here
}

export type EmployeeRegistryWithRelations = EmployeeRegistry & EmployeeRegistryRelations
