import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { del, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserWithUag } from '../../common'
import { User, UserAccessGroup } from '../../models'
import { UagUserController, UagUserControllerUseCasesBindings, UseUagUserUnlinkUsr } from './module'

const { v1, controller } = UagUserController

@authenticate(JwtStrategy.UserAccessToken)
export class UagsIdUsersFkDeleteController {
  constructor(
    @inject(UagUserControllerUseCasesBindings.v1.UseUagUserUnlinkUsr)
    private v1_UseUagUserLinkUsr: UseUagUserUnlinkUsr.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_0],
    resource: v1.uags.id.users.fk.del.resource,
    scopes: ['del'],
    voters: [AuthzBindings.Usr.GroupId],
  })
  @del(v1.uags.id.users.fk.path, {
    'x-controller-name': controller,
    description:
      '**[`root`|`group_0`]** : ' +
      'Unlink the target `Users.{fk}` from `UserAccessGroup.{id}`. ' +
      'Only work if the current user `UAG` rank is higher than the target `UAG`. ' +
      '(This operation do not soft/hard delete the users)',
    responses: {
      '200': {
        description: "[`UserWithUag`] : Updated `User`'s `UAG`",
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithUag),
          },
        },
      },
    },
  })
  async [v1.uags.id.users.fk.del.fn](
    @param.path.number('id', {
      description: '[`id`] : of `UserAccessGroup`',
    })
    id: typeof UserAccessGroup.prototype.id,
    @param.path.number('fk', {
      description: '[`fk`] : of target `User`',
    })
    fk: typeof User.prototype.id
  ): Promise<UserWithUag> {
    return this.v1_UseUagUserLinkUsr.call({
      uagIdentifier: id!,
      usrId: fk!,
    })
  }
}
