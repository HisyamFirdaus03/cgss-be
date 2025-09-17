import { Model, model, property } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { FieldExclusions } from '../../core'
import { User, UserAccessGroup, UserDetail } from '../../../models'

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
              exclude: UserWithUagAndUserDetailPagedUser.exclusions.user,
            }).properties,
            userAccessGroups: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ...getJsonSchema(UserAccessGroup, {
                    exclude: UserWithUagAndUserDetailPagedUser.exclusions.userAccessGroup,
                  }).properties,
                },
              },
            },
            userDetail: {
              type: 'object',
              properties: {
                ...getJsonSchema(UserDetail, {
                  exclude: UserWithUagAndUserDetailPagedUser.exclusions.userDetail,
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
export class UserWithUagAndUserDetailPagedUser extends Model {
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
    user: ['password', 'resetPwdToken', 'verificationToken'],
    userAccessGroup: [],
    userDetail: [],
  })
}
