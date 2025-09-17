import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { del, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserWithUserDetail } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseUserDeactive } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class Users_Id_Deactivate_DeleteController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserDeactivate) protected v1_UseUserDeactive: UseUserDeactive.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0],
    resource: v1.users.id.deactivate.del.resource,
    scopes: ['delete'],
    voters: [AuthzBindings.Usr.Rank],
  })
  @del(v1.users.id.deactivate.path, {
    'x-controller-name': controller,
    description:
      '[`root`|`rank`] : Deactivate user account (can only deactive target user account with ' +
      'lower ranking than the current user.',
    responses: {
      '204': {
        description: '[`UserWithUserDetail`] : User that was deactivated',
        content: {
          'text/plain': {
            schema: getModelSchemaRef(UserWithUserDetail),
          },
        },
      },
    },
  })
  async [v1.users.id.deactivate.del.fn](
    @param.path.number('id', {
      description: '[`id`] :  of `User` instance',
      required: true,
    })
    id: number
  ): Promise<UserWithUserDetail> {
    return this.v1_UseUserDeactive.call(id)
  }
}
