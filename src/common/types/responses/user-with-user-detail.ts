import { model } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { FieldExclusions } from '../../core'
import { User, UserDetail } from '../../../models'

@model({
  jsonSchema: {
    type: 'object',
    properties: {
      ...getJsonSchema(User, {
        exclude: UserWithUserDetail.exclusions.user,
      }).properties,
      userDetail: {
        type: 'object',
        properties: {
          ...getJsonSchema(UserDetail, {
            exclude: UserWithUserDetail.exclusions.userDetail,
          }).properties,
        },
      },
    },
  },
})
export class UserWithUserDetail extends User {
  static exclusions = new FieldExclusions({
    user: ['password', 'verificationToken', 'resetPwdToken'],
    userDetail: [],
  })
}
