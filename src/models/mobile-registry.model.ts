import { hasMany, model, property } from '@loopback/repository'
import { UserModifiableEntity } from './_user-modifiable-entity'
import { EmissionScope1MobileCombustion } from './emission-scope-1-mobile-combustion.model'

@model({ settings: { hiddenProperties: ['createdAt', 'createdId', 'updatedAt', 'updatedId', 'deletedAt', 'deletedId'] } })
export class MobileRegistry extends UserModifiableEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({ type: 'string', required: true })
  identity_no: string

  @property({ type: 'string', required: true })
  model: string

  // same as stationaryCombustion > typeId
  // this will be id that ref EmissionFactor > MobileCombustion > Distance > id
  @property({ type: 'string', required: true }) EF_MobileCombustionDistanceId: string

  @hasMany(() => EmissionScope1MobileCombustion) emissionScope1MobileCombustions: EmissionScope1MobileCombustion[]

  // if inactive, then don't show in dropdown.
  // previous mobile selected will remain as is
  @property({ type: 'string', required: true, jsonSchema: { enum: ['active', 'inactive'] } })
  status: 'active' | 'inactive'

  constructor(data?: Partial<MobileRegistry>) {
    super(data)
  }
}

export interface MobileRegistryRelations {
  // describe navigational properties here
}

export type MobileRegistryWithRelations = MobileRegistry & MobileRegistryRelations
