import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { Count, CountSchema } from '@loopback/repository'
import { del } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UagUserController, UagUserControllerUseCasesBindings, UseUagUserReset } from './module'

const { v1, controller } = UagUserController

@authenticate(JwtStrategy.UserAccessToken)
export class UagsUsersResetDeleteController {
  constructor(
    @inject(UagUserControllerUseCasesBindings.v1.UseUagUserReset) protected v1_UseUagUserReset: UseUagUserReset.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: v1.uags.users.reset.del.resource,
    scopes: ['delete'],
  })
  @del(v1.uags.users.reset.path, {
    'x-controller-name': controller,
    description:
      '**[`root`]** : ' +
      'Remove all user in all `UserAccessGroup`. ' +
      '(This operation do not soft/hard delete the user)',
    responses: {
      '200': {
        description: '[`Count`] : Number of users removed from all `UserAccessGroup`',
        content: {
          'application/json': {
            schema: CountSchema,
          },
        },
      },
    },
  })
  async [v1.uags.users.reset.del.fn](): Promise<Count> {
    return this.v1_UseUagUserReset.call()
  }
}
