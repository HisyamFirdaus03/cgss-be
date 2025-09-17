import { inject } from '@loopback/core'
import { get, getModelSchemaRef } from '@loopback/rest'
import { UseCase, UserLogout } from '../../common'
import { UserController } from './module'
import { UserControllerUseCasesBindings } from './module/usecases'

const { v1, controller } = UserController

export class User_Logout_GetController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserLogout)
    protected v1_UseUserLogout: UseCase<void, UserLogout | null>
  ) {}

  @get(v1.users.logout.path, {
    'x-controller-name': controller,
    description: '[`token`] : Logout current user represented by the `token` in the header',
    responses: {
      '200': {
        description: '[`UserLogout`] : Successful logout for the current `User` ',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserLogout),
          },
        },
      },
    },
  })
  async [v1.users.logout.get.fn](): Promise<UserLogout | null> {
    return this.v1_UseUserLogout.call()
  }
}
