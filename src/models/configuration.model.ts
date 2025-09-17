import { model, property } from '@loopback/repository'
import { UserModifiableEntity } from '../models/_user-modifiable-entity'

@model()
export class Configuration extends UserModifiableEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number

  @property({ type: 'number' })
  defaultBaseline: number

  @property({ type: 'date' })
  activitiesStartFrom: Date

  @property({ type: 'object' })
  optOutCalc: Record<'business-travel' | 'employee-commuting' | 'upstream' | 'downstream' | 'waste-generated', boolean>

  constructor(data?: Partial<Configuration>) {
    super(data)
  }
}

export interface ConfigurationRelations {
  // describe navigational properties here
}

export type ConfigurationWithRelations = Configuration & ConfigurationRelations;
