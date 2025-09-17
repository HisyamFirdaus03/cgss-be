import { model, property } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { FieldExclusions } from '../../core'
import { User, UserAccessGroup, UserDetail } from '../../../models'

@model({
  jsonSchema: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      ...getJsonSchema(User, {
        exclude: UserWithLoginSession.exclusions.user,
      }).properties,
      userDetail: {
        type: 'object',
        properties: {
          ...getJsonSchema(UserDetail, {
            exclude: UserWithLoginSession.exclusions.userDetail,
          }).properties,
        },
      },
      userAccessGroups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            ...getJsonSchema(UserAccessGroup, {
              exclude: UserWithLoginSession.exclusions.userAccessGroup,
            }).properties,
          },
        },
      },
    },
  },
})
export class UserWithLoginSession extends User {
  @property() accessToken: string
  @property() refreshToken: string

  static exclusions = new FieldExclusions({
    user: ['password', 'verificationToken', 'resetPwdToken', 'createdAt', 'updatedAt'],
    userDetail: ['userId'],
    userAccessGroup: ['description', 'createdAt', 'updatedAt'],
  })
}
