import { Model, model, property } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { FieldExclusions } from '../../core'
import { User, UserDetail } from '../../../models'

@model({
  jsonSchema: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            ...getJsonSchema(User, {
              exclude: UserWithUserDetailPagedUser.exclusions.user,
            }).properties,
            userDetail: {
              type: 'object',
              properties: {
                ...getJsonSchema(UserDetail, {
                  exclude: UserWithUserDetailPagedUser.exclusions.userDetail,
                }).properties,
              },
            },
          },
        },
      },
      pagination: {
        type: 'object',
        properties: {
          users: {
            type: 'object',
            properties: {
              skip: { type: 'number' },
              limit: { type: 'number' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  },
})
export class UserWithUserDetailPagedUser extends Model {
  @property()
  users: User[]

  @property()
  pagination: {
    users: {
      limit: number
      skip: number
      count: number
    }
  }

  static exclusions = new FieldExclusions({
    user: ['password', 'verificationToken', 'resetPwdToken'],
    userDetail: [],
    userAccessGroup: [],
  })
}
