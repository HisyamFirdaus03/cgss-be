import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { get, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseVerifyEmailById } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class Users_Id_VerifyEmail_GetController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserVerifyEmailById)
    protected v1_UseUserVerifyEmailById: UseVerifyEmailById.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0],
    resource: v1.users.id.verify_email.get.resource,
    scopes: ['get'],
    voters: [AuthzBindings.Usr.Rank],
  })
  @get(v1.users.id.verify_email.path, {
    'x-controller-name': controller,
    description:
      '[`root`|`rank`] : Verify user email by `User.id`. Only works ' +
      'for user with a lower ranking than the current user',
    responses: {
      '204': {
        description: '[`string`] : Email verification status message',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async [v1.users.id.verify_email.get.fn](
    @param.path.number('id', {
      description: '[`id`] :target account to be verified',
      required: true,
    })
    id: number
  ): Promise<string> {
    return this.v1_UseUserVerifyEmailById.call(id)
  }
}
