import { Entity, hasMany, hasOne, model, property } from '@loopback/repository'
import { UserAccessGroupMap } from './user-access-group-map.model'
import { UserAccessGroup } from './user-access-group.model'
import { UserDetail } from './user-detail.model'

@model({
  settings: {
    hiddenProperties: ['password', 'verificationToken', 'resetPwdToken'],
  },
})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number

  @property({
    type: 'string',
    required: true,
  })
  name: string

  @property({
    type: 'string',
    required: false,
    index: { unique: true },
  })
  username: string

  @property({
    type: 'string',
    required: true,
    index: { unique: true },
  })
  email: string

  /** @deprecated */
  @property({
    type: 'string',
    index: { unique: true },
  })
  cardId?: string

  /** @deprecated */
  @property({
    type: 'string',
    index: { unique: true },
  })
  staffId?: string

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean

  /** @deprecated */
  @property({ type: 'string' })
  realm?: string

  @property({
    type: 'string',
    hidden: true,
  })
  password?: string

  @property({
    type: 'string',
    length: 512,
    mysql: {
      datatype: 'varchar',
      dataLength: 512,
    },
  })
  verificationToken?: string

  @property({
    type: 'string',
    length: 512,
    mysql: {
      datatype: 'varchar',
      dataLength: 512,
    },
  })
  resetPwdToken?: string

  @property({
    type: 'boolean',
    default: false,
  })
  emailVerified?: boolean

  @property({
    type: 'date',
    defaultFn: 'now',
    mysql: { dataType: 'datetime' },
  })
  createdAt?: string

  @property({
    type: 'date',
    defaultFn: 'now',
    mysql: {
      dataType: 'datetime',
    },
  })
  updatedAt?: string

  @hasMany(() => UserAccessGroup, { through: { model: () => UserAccessGroupMap, keyTo: 'accessGroupId' } })
  userAccessGroups: UserAccessGroup[]

  @hasOne(() => UserDetail) userDetail: UserDetail

  constructor(data?: Partial<User>) {
    super(data)
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations
