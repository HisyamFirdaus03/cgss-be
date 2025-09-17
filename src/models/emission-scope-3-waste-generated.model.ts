import { belongsTo, hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import {
  EmployeeRegistry,
  GroupBy,
  EmissionScope3WasteGeneratedActivity,
  EmissionFactor,
} from '../models'

@model({
  settings: {
    hiddenProperties: ['createdId', 'createdAt', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'],
    scope: { where: { deletedId: null, deletedAt: null } },
  },
})
export class EmissionScope3WasteGenerated extends UserModifiableEntity {
  @property({ type: 'number', id: true, generated: true }) id?: number
  @property({ type: 'string', required: true }) category: string

  // composite key
  @property({
    type: 'string',
    required: true,
    index: true,
  }) type: 'waste_type_specific_method' | 'supplier_specific_method'
  
  @property({
    type: 'string',
    required: true,
    index: true,
  }) materialId: EmissionFactor['waste_generated'][number]['material'] | EmissionFactor['waste_generated_supplier_specific_method'][number]['name'] // FK to EmissionFactor > waste_generated > id
  @property({
    type: 'string',
    index: true,
  }) method: keyof Omit<EmissionFactor['waste_generated'][number], 'id' | 'material'> // FK to EmissionFactor > waste_generated > id
  @belongsTo(() => GroupBy, undefined, { index: true }) groupById: number

  @hasMany(() => EmissionScope3WasteGeneratedActivity, { keyTo: 'wasteGeneratedId' })
  activities: EmissionScope3WasteGeneratedActivity[]

  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<EmissionScope3WasteGenerated>) {
    super(data)
  }
}

export interface EmissionScope3WasteGeneratedRelations {
  // describe navigational properties here
  employeeRegistry: EmployeeRegistry
  groupBy: GroupBy
}

export type EmissionScope3WasteGeneratedWithRelations =
  EmissionScope3WasteGenerated
  & EmissionScope3WasteGeneratedRelations
