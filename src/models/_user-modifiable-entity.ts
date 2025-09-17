import { belongsTo, model } from '@loopback/repository'
import { User } from './user.model'
import { BaseEntity } from './_base-entity'

@model()
export class UserModifiableEntity extends BaseEntity {
  @belongsTo(() => User, { name: 'createdBy' }) createdId: number
  @belongsTo(() => User, { name: 'updatedBy' }) updatedId?: number
  @belongsTo(() => User, { name: 'deletedBy' }) deletedId?: number

  constructor(data?: Partial<UserModifiableEntity>) {
    super(data)
  }
}
