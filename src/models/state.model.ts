import { Entity, hasMany, model, property } from '@loopback/repository'
import { PlantActual } from './plant-actual.model'

@model()
export class State extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({ type: 'string' })
  state_name?: string

  @property({ type: 'string' })
  location_site?: string

  @property({ type: 'number', mysql: { dataType: 'double' } })
  longitude?: number

  @property({ type: 'number', mysql: { dataType: 'double' } })
  latitude?: number

  @hasMany(() => PlantActual) plantActuals: PlantActual[]

  constructor(data?: Partial<State>) {
    super(data)
  }
}

export interface StateRelations {
  // describe navigational properties here
}

export type StateWithRelations = State & StateRelations
