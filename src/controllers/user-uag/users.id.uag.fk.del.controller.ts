import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { del, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { User, UserAccessGroup } from '../../models'
import { UserUagController, UserUagControllerUseCasesBindings, UseUserUagUnlinkByUagId } from './module'

const { v1, controller } = UserUagController

@authenticate(JwtStrategy.UserAccessToken)
export class DelUsersIdUagFkController {
  constructor(
    @inject(UserUagControllerUseCasesBindings.v1.UseUserUagUnlinkByUagId)
    protected v1_UseUserUagUnlinkByUagId: UseUserUagUnlinkByUagId.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_1],
    resource: v1.users.id.uag.fk.del.resource,
    scopes: ['del'],
    voters: [AuthzBindings.Usr.GroupId],
  })
  @del(v1.users.id.uag.fk.path, {
    'x-controller-name': controller,
    description:
      '[`root`|`group_1`] : Unlink `User` from target `UserAccessGroup`. ' +
      'Only allowed if the target `UserAccessGroup.{id=fk}` has a lower ranking than the ' +
      'current user',
    responses: {
      '200': {
        description: '[`UserAccessGroup[]`] : List of currently linked `UserAccessGroup` for target `User`',
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
  async [v1.users.id.uag.fk.del.fn](
    @param.path.number('id', {
      description: '[`id`] : of `User` to be unlinked from the target `UserAccessGroup`',
    })
    id: typeof User.prototype.id,
    @param.path.number('fk', {
      description: '[`fk`] : of `UserAccessGroup` to be unlinked from the `User`',
    })
    fk: typeof UserAccessGroup.prototype.id
  ): Promise<UserAccessGroup[]> {
    return this.v1_UseUserUagUnlinkByUagId.call({
      userId: id!,
      uagId: fk!,
    })
  }
}
