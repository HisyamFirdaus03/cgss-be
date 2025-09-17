import { model } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { FieldExclusions } from '../../core'
import { User, UserAccessGroup } from '../../../models'

@model({
  jsonSchema: {
    type: 'object',
    properties: {
      ...getJsonSchema(User, {
        exclude: UserWithUag.exclusions.user,
      }).properties,
      userAccessGroups: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            ...getJsonSchema(UserAccessGroup, {
              exclude: UserWithUag.exclusions.userAccessGroup,
            }).properties,
          },
        },
      },
    },
  },
})
export class UserWithUag extends User {
  static exclusions = new FieldExclusions({
    user: ['password', 'verificationToken', 'resetPwdToken'],
    userAccessGroup: ['createdAt', 'updatedAt'],
  })
}
