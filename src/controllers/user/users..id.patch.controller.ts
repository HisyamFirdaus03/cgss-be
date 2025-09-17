import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { getModelSchemaRef, param, patch, requestBody } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserPatch, UserWithUserDetail } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseUserUpdateById } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class PatchUsersIdController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserUpdateById) private v1_UseUserUpdateById: UseUserUpdateById.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0],
    resource: v1.users.id.update.patch.resource,
    scopes: ['get'],
    voters: [AuthzBindings.Usr.Rank],
  })
  @patch(v1.users.id.update.path, {
    'x-controller-name': controller,
    description: "[`root`|`rank`] : Update user's attributes (must be in a " + 'higher ranking than the target user)',
    responses: {
      '204': {
        description: "[`UserWithUserDetails`] : Updated user's attributes",
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithUserDetail),
          },
        },
      },
    },
  })
  async [v1.users.id.update.patch.fn](
    @param.path.number('id', {
      description: '[`id`] : target User account',
    })
    id: number,
    @requestBody({
      description: '[`Partial<UserPatch>`]: user attributes',
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserPatch, { partial: true, exclude: ['id'] }),
        },
      },
    })
    user: UserPatch
  ): Promise<UserWithUserDetail> {
    user.id = id
    return this.v1_UseUserUpdateById.call(user)
  }
}
