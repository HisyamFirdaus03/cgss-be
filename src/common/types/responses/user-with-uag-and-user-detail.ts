import { model } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { FieldExclusions } from '../../core'
import { User, UserAccessGroup, UserDetail } from '../../../models'

@model({
  jsonSchema: {
    type: 'object',
    properties: {
      ...getJsonSchema(User, {
        exclude: UserWithUagAndUserDetail.exclusions.user,
      }).properties,
      userAccessGroups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            ...getJsonSchema(UserAccessGroup, {
              exclude: UserWithUagAndUserDetail.exclusions.userAccessGroup,
            }).properties,
          },
        },
      },
      userDetail: {
        type: 'object',
        properties: {
          ...getJsonSchema(UserDetail, {
            exclude: UserWithUagAndUserDetail.exclusions.userDetail,
          }).properties,
        },
      },
    },
  },
})
export class UserWithUagAndUserDetail extends User {
  static exclusions = new FieldExclusions({
    user: ['password', 'resetPwdToken', 'verificationToken'],
    userAccessGroup: ['createdAt', 'updatedAt'],
    userDetail: ['userId'],
  })
}
