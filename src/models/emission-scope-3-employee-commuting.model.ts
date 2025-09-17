import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmployeeRegistry, GroupBy, EmissionScope3EmployeeCommutingActivity } from '../models'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope3EmployeeCommuting extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number

  // composite key
  @belongsTo(() => EmployeeRegistry, undefined, { index: true }) employeeRegistryId: number
  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number

  @hasMany(() => EmissionScope3EmployeeCommutingActivity, { keyTo: 'employeeCommutingId' })
  activities: EmissionScope3EmployeeCommutingActivity[]

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<EmissionScope3EmployeeCommuting>) {
    super(data)
  }
}

export interface EmissionScope3EmployeeCommutingRelations {
  // describe navigational properties here
  employeeRegistry: EmployeeRegistry
  groupBy: GroupBy
}

export type EmissionScope3EmployeeCommutingWithRelations = EmissionScope3EmployeeCommuting & EmissionScope3EmployeeCommutingRelations
