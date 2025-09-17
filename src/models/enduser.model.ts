import { Entity, model, property, hasMany } from '@loopback/repository'
import { PlantActual } from './plant-actual.model'

@model({
  settings: {
    hiddenProperties: ['password', 'verificationToken'],
  },
})
export class Enduser extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({ type: 'string' })
  password?: string

  /** @deprecated */
  @property({ type: 'string', index: { unique: true } })
  cardid?: string

  /** @deprecated */
  @property({ type: 'string', index: { unique: true } })
  staffid?: string

  @property({ type: 'string', index: { unique: true } })
  name?: string

  @property({ type: 'string' })
  phonenumber?: string

  @property({ type: 'string' })
  isdeleted?: string

  @property({ type: 'string' })
  isgroup?: string

  @property({
    type: 'date',
  })
  createdat?: string

  @property({
    type: 'date',
  })
  updatedat?: string

  @property({ type: 'string' })
  realm?: string

  @property({ type: 'string', index: { unique: true } })
  email?: string

  @property({ type: 'number' })
  emailverified?: number

  @property({ type: 'string' })
  verificationtoken?: string

  @hasMany(() => PlantActual)
  plantActuals: PlantActual[]

  constructor(data?: Partial<Enduser>) {
    super(data)
  }
}

export interface EnduserRelations {
  // describe navigational properties here
}

export type EnduserWithRelations = Enduser & EnduserRelations
