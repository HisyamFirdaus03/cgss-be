import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { get, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseUserRequestEmailVerificationById } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class Users_Id_RequestEmailVerification_GetController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserRequestEmailVerificationById)
    protected v1_UseUserRequestEmailVerificationById: UseUserRequestEmailVerificationById.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0],
    resource: v1.users.id.request_email_verification.get.resource,
    scopes: ['get'],
    voters: [AuthzBindings.Usr.Rank],
  })
  @get(v1.users.id.request_email_verification.path, {
    'x-controller-name': controller,
    description:
      '[`root`|`rank`] : Request email verification link by `User.id` (Link would be' +
      ' sent to email, can only request for user with a lower ranking than the current user)',
    responses: {
      '204': {
        description: '[`string`] : Link to web app to invoke the email verification API',
        content: {
          'text/uri-list': {
            schema: {
              type: 'string',
            },
            example: 'https://<domain_name>/verify-email?key=<token>',
          },
        },
      },
    },
  })
  async [v1.users.id.request_email_verification.get.fn](
    @param.path.number('id', {
      description: '[`id`] : target account for the email to be verified.',
      required: true,
    })
    id: number
  ): Promise<string> {
    return this.v1_UseUserRequestEmailVerificationById.call(id)
  }
}
