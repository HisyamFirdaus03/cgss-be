import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { FilterExcludingWhere } from '@loopback/repository'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserWithUagAndUserDetail } from '../../common'
import { User } from '../../models'
import { UserController, UserControllerUseCasesBindings, UseUserFindById } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsersIdController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserFindById) private v1_UseUserFindById: UseUserFindById.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0, UserAccessLevel.name.owner_0],
    resource: v1.users.id.find.get.resource,
    scopes: ['get'],
    voters: [AuthzBindings.Usr.Owner, AuthzBindings.Usr.Rank],
  })
  @get(v1.users.id.find.path, {
    'x-controller-name': controller,
    description:
      '[`root`|`rank`|`owner`] : Get user particulars. Only works ' +
      ' for own account or account with a lower ranking than the current user.',
    responses: {
      '200': {
        description: '[`User`] : User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithUagAndUserDetail),
          },
        },
      },
    },
  })
  async [v1.users.id.find.get.fn](
    @param.path.number('id', {
      description: '[`id`] of the target user.',
      required: true,
    })
    id: number,
    @param.filter(User, {
      exclude: ['where', 'limit', 'offset', 'skip', 'order'],
    })
    filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.v1_UseUserFindById.call({
      userId: id,
      filter: filter,
    })
  }
}
