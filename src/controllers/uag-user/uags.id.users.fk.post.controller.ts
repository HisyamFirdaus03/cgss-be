import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { getModelSchemaRef, param, post } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserWithUag } from '../../common'
import { User, UserAccessGroup } from '../../models'
import { UagUserController, UagUserControllerUseCasesBindings, UseUagUserLinkUsr } from './module'

const { v1, controller } = UagUserController

@authenticate(JwtStrategy.UserAccessToken)
export class UagsIdUsersFkPostController {
  constructor(
    @inject(UagUserControllerUseCasesBindings.v1.UseUagUserLinkUsr) private v1_UseUagUserLinkUsr: UseUagUserLinkUsr.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_0],
    resource: v1.uags.id.users.fk.del.resource,
    scopes: ['post'],
    voters: [AuthzBindings.Usr.GroupId],
  })
  @post(v1.uags.id.users.fk.path, {
    'x-controller-name': controller,
    description:
      '**[`root`|`group_0`]** : ' +
      'Link target `User.{fk}` to `UserAccessGroup.{id}`. ' +
      "Only work if the current user's `UAG` rank is higher than the target `UAG`. ",
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
  async [v1.uags.id.users.fk.post.fn](
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
