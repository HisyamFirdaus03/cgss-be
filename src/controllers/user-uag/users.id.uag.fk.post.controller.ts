import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { getModelSchemaRef, param, post } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { User, UserAccessGroup } from '../../models'
import { UserUagController, UserUagControllerUseCasesBindings, UseUserUagLinkByUagId } from './module'

const { v1, controller } = UserUagController

@authenticate(JwtStrategy.UserAccessToken)
export class PostUsersIdUagFkController {
  constructor(
    @inject(UserUagControllerUseCasesBindings.v1.UseUserUagLinkByUagId)
    protected v1_UseUserUagLinkByUagId: UseUserUagLinkByUagId.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_1],
    resource: v1.users.id.uag.fk.post.resource,
    scopes: ['post'],
    voters: [AuthzBindings.Usr.GroupId],
  })
  @post(v1.users.id.uag.fk.path, {
    'x-controller-name': controller,
    description:
      '[`root`|`group_1`] : Link `User` to target `UserAccessGroup`. ' +
      'Only allowed if the target `UserAccessGroup.{id=fk}` has a lower ranking than the ' +
      'current user',
    responses: {
      '200': {
        description: '[`UserAccessGroup[]`] : List of linked `UserAccessGroup` for target `User`',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserAccessGroup),
            },
          },
        },
      },
    },
  })
  async [v1.users.id.uag.fk.post.fn](
    @param.path.number('id', {
      description: '[`id`] : of `User` to be linked to the target `UserAccessGroup`',
    })
    id: typeof User.prototype.id,
    @param.path.number('fk', {
      description: '[`fk`] : of `UserAccessGroup` to be linked to the `User`',
    })
    fk: typeof UserAccessGroup.prototype.id
  ): Promise<UserAccessGroup[]> {
    return this.v1_UseUserUagLinkByUagId.call({
      userId: id!,
      uagId: fk!,
    })
  }
}
