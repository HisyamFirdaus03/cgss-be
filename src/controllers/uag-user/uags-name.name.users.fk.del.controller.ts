import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { del, getModelSchemaRef, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserWithUag } from '../../common'
import { User } from '../../models'
import { UagUserController, UagUserControllerUseCasesBindings, UseUagUserUnlinkUsr } from './module'

const { v1, controller } = UagUserController

@authenticate(JwtStrategy.UserAccessToken)
export class UagsNameNameUsersFkDeleteController {
  constructor(
    @inject(UagUserControllerUseCasesBindings.v1.UseUagUserUnlinkUsr)
    private v1_UseUagUserLinkUsr: UseUagUserUnlinkUsr.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_0],
    resource: v1.uags.name.users.fk.del.resource,
    scopes: ['del'],
    voters: [AuthzBindings.Usr.GroupName],
  })
  @del(v1.uags.name.users.fk.path, {
    'x-controller-name': controller,
    description:
      '**[`root`|`group_0`]** : ' +
      'Unlink `User.{fk}` from `UserAccessGroup.{name}`. ' +
      "Only work if the current user `UAG`'s rank is higher than the target `UAG`. " +
      '(This operation do not soft/hard delete the users)',
    responses: {
      '200': {
        description: "[`UserWithUag`] : Updated `Users`'s `UAG`",
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithUag),
          },
        },
      },
    },
  })
  async [v1.uags.name.users.fk.del.fn](
    @param.path.string('name', {
      description: '[`name`] : of `UserAccessGroup`',
    })
    name: UserAccessLevel.name,
    @param.path.number('fk', {
      description: '[`fk`] : of target `User`',
    })
    fk: typeof User.prototype.id
  ): Promise<UserWithUag> {
    return this.v1_UseUagUserLinkUsr.call({
      uagIdentifier: name!,
      usrId: fk!,
    })
  }
}
