import { inject } from '@loopback/core'
import { getModelSchemaRef, post, requestBody } from '@loopback/rest'
import { UseCase, UserWithLoginSession, WebLoginCredential, WebLoginCredentialSchema } from '../../common'
import { UserController } from './module'
import { UserControllerUseCasesBindings } from './module/usecases'

const { v1, controller } = UserController

export class User_Login_PostController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserLogin)
    protected v1_UseUserLogin: UseCase<WebLoginCredential, UserWithLoginSession>
  ) {}

  @post(v1.users.login.path, {
    'x-controller-name': controller,
    description: '[`public`] : User login using `username` or `email`',
    responses: {
      '200': {
        description: '[`UserWithLoginSession`] Current user login session',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithLoginSession),
          },
        },
      },
    },
  })
  async [v1.users.login.post.fn](
    @requestBody({
      description: '[`WebLoginCredential`] : Login credential attributes',
      required: true,
      content: {
        'application/json': {
          schema: WebLoginCredentialSchema,
        },
      },
    })
    credential: WebLoginCredential
  ): Promise<UserWithLoginSession> {
    return this.v1_UseUserLogin.call(credential)
  }
}
