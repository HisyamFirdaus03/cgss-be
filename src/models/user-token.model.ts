import { Entity, model, property } from '@loopback/repository'

@model()
export class UserToken extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({
    type: 'string',
    length: 512,
    required: true,
    mysql: {
      datatype: 'varchar',
      dataLength: 512,
    },
  })
  accessToken: string

  @property({
    type: 'string',
    length: 512,
    required: true,
    mysql: {
      datatype: 'varchar',
      dataLength: 512,
    },
  })
  refreshToken: string

  @property({
    type: 'number',
    required: true,
  })
  securityId: number

  @property({
    type: 'date',
    required: true,
  })
  expiresAt: Date

  constructor(data?: Partial<UserToken>) {
    super(data)
  }
}

export interface UserTokenRelations {
  // describe navigational properties here
}

export type UserTokenWithRelations = UserToken & UserTokenRelations
