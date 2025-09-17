import { belongsTo, Entity, model, property } from '@loopback/repository'
import { User } from './user.model'

@model()
export class UserDetail extends Entity {
  @property({ type: 'string' })
  phoneNumber?: string

  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({ type: 'string' })
  address1?: string

  @property({ type: 'string' })
  address2?: string

  @property({ type: 'string' })
  picture?: string

  @belongsTo(() => User, { name: 'user' })
  userId: number

  constructor(data?: Partial<UserDetail>) {
    super(data)
  }
}

export interface UserDetailRelations {
  user?: User;
}

export type UserDetailWithRelations = UserDetail & UserDetailRelations
