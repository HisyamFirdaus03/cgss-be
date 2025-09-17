import { inject } from '@loopback/core'
import { post, requestBody } from '@loopback/rest'
import { UserController, UserControllerUseCasesBindings, UseUserRequestResetPassword } from './module'

const { v1, controller } = UserController

export class Users_RequestPasswordReset_PostController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserRequestResetPassword)
    protected v1_UseUserRequestResetPassword: UseUserRequestResetPassword.v1
  ) {}

  @post(v1.users.request_password_reset.path, {
    'x-controller-name': controller,
    description:
      '[`public`] : Request password reset `link` using `email` or `username` ' +
      '(Link with `password reset token` would be sent to email)',
    responses: {
      '200': {
        description: '[`string`] : Link to Web App for user to submit their new password',
        content: {
          'text/uri-list': {
            schema: {
              type: 'string',
              title: 'Reset password request',
            },
            example: 'https://<domain_name>/reset-password?key=<token>',
          },
        },
      },
    },
  })
  async [v1.users.request_password_reset.post.fn](
    @requestBody({
      description: '[`{usernameOrEmail:string}`] : Login credential attributes (username or email)',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              usernameOrEmail: { type: 'string' },
            },
            required: ['usernameOrEmail'],
            default: {
              usernameOrEmail: 'system',
            },
          },
        },
      },
    })
    credential: {
      usernameOrEmail: 'string'
    }
  ): Promise<String> {
    return this.v1_UseUserRequestResetPassword.call(credential)
  }
}
