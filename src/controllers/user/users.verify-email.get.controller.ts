import { authenticate } from '@loopback/authentication'
import { inject } from '@loopback/core'
import { get } from '@loopback/rest'
import { JwtStrategy } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseVerifyEmailByToken } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserVerificationToken)
export class Users_VerifyEmail_GetController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserVerifyEmailByToken)
    protected v1_UseUserVerifyEmailByToken: UseVerifyEmailByToken.v1
  ) {}

  @get(v1.users.verify_email.path, {
    'x-controller-name': controller,
    description:
      '[`token`] : API for user to verify their email from web app sent to ' +
      'user email (link). Must set the `authorization` header to the given ' +
      '`verification token`',
    responses: {
      '200': {
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
  async [v1.users.verify_email.get.fn](): Promise<string> {
    return this.v1_UseUserVerifyEmailByToken.call()
  }
}
