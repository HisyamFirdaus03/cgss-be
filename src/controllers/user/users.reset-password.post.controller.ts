import { authenticate } from '@loopback/authentication'
import { inject } from '@loopback/core'
import { post, requestBody } from '@loopback/rest'
import { JwtStrategy } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseUserResetPasswordByToken } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserPasswordToken)
export class Users_ResetPassword_PostController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserResetPasswordByToken)
    protected v1_UseUserResetPasswordByToken: UseUserResetPasswordByToken.v1
  ) {}

  @post(v1.users.reset_password.path, {
    'x-controller-name': controller,
    description:
      '[`token`] : API for user to submit their new password (call from web app ' +
      'link sent to user email). Must set the `authorization` header to the ' +
      'given `password reset token`',
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
  async [v1.users.reset_password.post.fn](
    @requestBody({
      description: '[`{password:string}`] : New password',
      required: true,
      content: {
        'application/json': {
          schema: {
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
    pwdJson: {
      password: string
    }
  ): Promise<string> {
    return this.v1_UseUserResetPasswordByToken.call(pwdJson)
  }
}
