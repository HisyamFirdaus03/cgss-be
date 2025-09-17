import { inject } from '@loopback/core'
import { post, requestBody } from '@loopback/rest'
import { WebLoginCredential, WebLoginCredentialSchema } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseUserRequestEmailVerificationByCred } from './module'

const { v1, controller } = UserController

export class Users_RequestEmailVerification__PostController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserRequestEmailVerificationByCred)
    protected v1_UseUserRequestEmailVerificationByCred: UseUserRequestEmailVerificationByCred.v1
  ) {}

  @post(v1.users.request_email_verification.path, {
    'x-controller-name': controller,
    description:
      '[`public`] : Request new verification link using `email` or `username` ' +
      'with `password` (Link would be sent to email)',
    responses: {
      '200': {
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
  async [v1.users.request_email_verification.post.fn](
    @requestBody({
      description: '[`WebLoginCredential`] : Login credential attributes (username or email and password)',
      required: true,
      content: {
        'application/json': {
          schema: WebLoginCredentialSchema,
        },
      },
    })
    credential: WebLoginCredential
  ): Promise<string> {
    return this.v1_UseUserRequestEmailVerificationByCred.call(credential)
  }
}
