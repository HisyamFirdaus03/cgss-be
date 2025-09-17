import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { Filter } from '@loopback/repository'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserWithUagAndUserDetailPagedUser } from '../../common'
import { User, UserAccessGroup } from '../../models'
import { UagUserController, UagUserControllerUseCasesBindings, UseUagUserFindUsrs } from './module'

const { v1, controller } = UagUserController

@authenticate(JwtStrategy.UserAccessToken)
export class UagsIdUsersGetController {
  constructor(
    @inject(UagUserControllerUseCasesBindings.v1.UseUagUserFindUsrs)
    private v1_UseUagUserFindUsrs: UseUagUserFindUsrs.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_0],
    resource: v1.uags.id.users.get.resource,
    scopes: ['get'],
    voters: [AuthzBindings.Usr.GroupId],
  })
  @get(v1.uags.id.users.path, {
    'x-controller-name': controller,
    description:
      '**[`root`|`group_0`]** : ' +
      'Get all users in the `UserAccessGroup`. ' +
      "Only works if the current user's `UAG` rank is higher than the target `UAG`",
    responses: {
      '200': {
        description: '[`UserWithUagAndUserDetailPagedUser`] : `Users` in `UserAccessGroup.{id}`',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithUagAndUserDetailPagedUser),
          },
        },
      },
    },
  })
  async [v1.uags.id.users.get.fn](
    @param.path.number('id', {
      description: '[`id`] : of `UserAccessGroup`',
    })
    id: typeof UserAccessGroup.prototype.id,
    @param.filter(User, {
      name: 'User Filter',
    })
    filter?: Filter<User>
  ): Promise<UserWithUagAndUserDetailPagedUser> {
    return this.v1_UseUagUserFindUsrs.call({
      uagIdentifier: id!,
      filter,
    })
  }
}
