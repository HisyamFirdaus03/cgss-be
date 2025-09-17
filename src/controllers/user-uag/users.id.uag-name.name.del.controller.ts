import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { del, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { User, UserAccessGroup } from '../../models'
import { UserUagController, UserUagControllerUseCasesBindings, UseUserUagUnlinkByUagName } from './module'

const { v1, controller } = UserUagController

@authenticate(JwtStrategy.UserAccessToken)
export class DelUsersIdUagNameNameController {
  constructor(
    @inject(UserUagControllerUseCasesBindings.v1.UseUserUagUnlinkByUagName)
    protected v1_UseUserUagUnlinkByUagName: UseUserUagUnlinkByUagName.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_1],
    resource: v1.users.id.uag.name.del.resource,
    scopes: ['del'],
    voters: [AuthzBindings.Usr.GroupName],
  })
  @del(v1.users.id.uag.name.path, {
    'x-controller-name': controller,
    description:
      '[`root`|`group_1`] : Unlink `User` from `UserAccessGroup`. ' +
      'Only allowed if the target `UserAccessGroup.name` has a lower ranking than the ' +
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
  async [v1.users.id.uag.name.del.fn](
    @param.path.number('id', {
      description: '[`id`] : of `User` to be unlinked from the target `UserAccessGroup`',
    })
    id: typeof User.prototype.id,
    @param.path.string('name', {
      description: '[`name`] : of `UserAccessGroup` to be unlinked from the `User`',
    })
    name: typeof UserAccessGroup.prototype.name
  ): Promise<UserAccessGroup[]> {
    return this.v1_UseUserUagUnlinkByUagName.call({
      userId: id!,
      uagName: name!,
    })
  }
}
