import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { param, post, requestBody } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseUserResetPasswordById } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class Users_Id_ResetPassword_PostController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserResetPasswordById)
    protected v1_UseUserResetPasswordById: UseUserResetPasswordById.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0, UserAccessLevel.name.owner_0],
    resource: v1.users.id.reset_password.post.resource,
    scopes: ['post'],
    voters: [AuthzBindings.Usr.Owner, AuthzBindings.Usr.Rank],
  })
  @post(v1.users.id.reset_password.path, {
    'x-controller-name': controller,
    description:
      '[`root`|`rank`|`owner`] : Set a new password for `User.id` ' +
      'without reset password token. Only work for own account or for user ' +
      'account with a lower ranking than the current user.',
    responses: {
      '200': {
        description: '[`string`] : Reset password status message',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
              title: 'Status',
            },
          },
        },
      },
    },
  })
  async [v1.users.id.reset_password.post.fn](
    @param.path.number('id', {
      description: '[`id`] : of target account to be updated',
      required: true,
    })
    id: number,
    @requestBody({
      description: '[`{password:string}`] : New password',
      required: true,
      content: {
        'application/json': {
          schema: {
            title: 'pwdJson',
            type: 'object',
            properties: {
              password: { type: 'string' },
            },
            required: ['password'],
            default: {
              password: '12345678',
            },
          },
        },
      },
    })
    pwdJson: { password: 'string' }
  ): Promise<string> {
    return this.v1_UseUserResetPasswordById.call({
      userId: id,
      password: pwdJson.password,
    })
  }
}
