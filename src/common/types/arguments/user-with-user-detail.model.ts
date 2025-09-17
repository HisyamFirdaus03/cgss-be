import { model } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { UserAccessLevel } from '../../authz'
import { User, UserDetail } from '../../../models'

@model({
  jsonSchema: {
    type: 'object',
    properties: {
      ...getJsonSchema(User, {
        exclude: [
          'id',
          'verificationToken',
          'isDeleted',
          'emailVerified',
          // 'realm',
          'resetPwdToken',
          'createdAt',
          'updatedAt',
        ],
      }).properties,
      userDetail: {
        type: 'object',
        properties: {
          ...getJsonSchema(UserDetail, {
            exclude: ['id', 'userId'],
          }).properties,
        },
      },
    },
  },
})
export class UserWithUserDetailModel extends User {
  uagIdentifier: number | UserAccessLevel.name
}
