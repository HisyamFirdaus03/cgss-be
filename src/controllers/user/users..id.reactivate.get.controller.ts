import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserWithUserDetail } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseUserReactivate } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class Users_Id_Reactivate_GetController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserReactivate) protected v1_UseUserReactivate: UseUserReactivate.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0],
    resource: v1.users.id.reactivate.get.resource,
    scopes: ['get'],
    voters: [AuthzBindings.Usr.Rank],
  })
  @get(v1.users.id.reactivate.path, {
    'x-controller-name': controller,
    description:
      '[`token`] : Reactivate the user account (can only reactivate ' +
      'user account with a lower ranking than the current user)',
    responses: {
      '204': {
        description: '[`UserWithUserDetail`] : User account that was re-activated',
        content: {
          'text/plain': {
            schema: getModelSchemaRef(UserWithUserDetail),
          },
        },
      },
    },
  })
  async [v1.users.id.reactivate.get.fn](
    @param.path.number('id', {
      description: '[`id`] :  of `User` instance',
      required: true,
    })
    id: number
  ): Promise<UserWithUserDetail> {
    return this.v1_UseUserReactivate.call(id)
  }
}
