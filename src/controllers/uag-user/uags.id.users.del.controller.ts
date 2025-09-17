import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { Count, CountSchema } from '@loopback/repository'
import { del, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { UserAccessGroup } from '../../models'
import { UagUserController, UagUserControllerUseCasesBindings, UseUagUserUnlinkUsrs } from './module'

const { v1, controller } = UagUserController

@authenticate(JwtStrategy.UserAccessToken)
export class UagsIdUsersDeleteController {
  constructor(
    @inject(UagUserControllerUseCasesBindings.v1.UseUagUserUnlinkUsrs)
    private v1_UseUagUserLinkUsrs: UseUagUserUnlinkUsrs.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_0],
    resource: v1.uags.id.users.del.resource,
    scopes: ['del'],
    voters: [AuthzBindings.Usr.GroupId],
  })
  @del(v1.uags.id.users.path, {
    'x-controller-name': controller,
    description:
      '**[`root`|`group_0`]** : ' +
      'Unlink all users in the `UserAccessGroup.{id}`. ' +
      'Only work if the current user `UAG` rank is higher than the target `UAG`. ' +
      '(This operation do not soft/hard delete the users)',
    responses: {
      '200': {
        description: '[`Count`] : number of `User`s unlinked',
        content: {
          'application/json': {
            schema: CountSchema,
          },
        },
      },
    },
  })
  async [v1.uags.id.users.del.fn](
    @param.path.number('id', {
      description: '[`id`] : of `UserAccessGroup`',
    })
    id: typeof UserAccessGroup.prototype.id
  ): Promise<Count> {
    return this.v1_UseUagUserLinkUsrs.call({
      idOrName: id!,
    })
  }
}
