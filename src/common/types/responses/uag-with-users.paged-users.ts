import { model, property } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { FieldExclusions } from '../../core'

import { User, UserAccessGroup, UserDetail } from '../../../models'

@model({
  jsonSchema: {
    type: 'object',
    properties: {
      ...getJsonSchema(UserAccessGroup, {
        exclude: UagWithUserPagedUsers.exclusions.userAccessGroup,
      }).properties,
      users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            ...getJsonSchema(User, {
              exclude: UagWithUserPagedUsers.exclusions.user,
            }).properties,
            userDetail: {
              type: 'object',
              properties: {
                ...getJsonSchema(UserDetail, {
                  exclude: UagWithUserPagedUsers.exclusions.userDetail,
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
export class UagWithUserPagedUsers extends UserAccessGroup {
  @property()
  pagination?: {
    users: {
      limit: number
      skip: number
      count: number
    }
  }

  static exclusions = new FieldExclusions({
    userAccessGroup: [],
    user: ['password', 'verificationToken', 'resetPwdToken'],
    userDetail: [],
  })
}
