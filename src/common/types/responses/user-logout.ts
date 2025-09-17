import { model } from '@loopback/repository'
import { getJsonSchema } from '@loopback/rest'
import { FieldExclusions } from '../../core'
import { User } from '../../../models'

@model({
  jsonSchema: getJsonSchema(User, {
    exclude: UserLogout.exclusions.user,
  }),
})
export class UserLogout extends User {
  static exclusions = new FieldExclusions({
    user: [
      'password',
      // 'realm',
      'isDeleted',
      'createdAt',
      'updatedAt',
      'verificationToken',
      'resetPwdToken',
      'emailVerified',
    ],
  })
}
