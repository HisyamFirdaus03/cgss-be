import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { getModelSchemaRef, param, post } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel, UserWithUag } from '../../common'
import { User } from '../../models'
import { UagUserController, UagUserControllerUseCasesBindings, UseUagUserLinkUsr } from './module'

const { v1, controller } = UagUserController

@authenticate(JwtStrategy.UserAccessToken)
export class UagsNameNameUsersFkPostController {
  constructor(
    @inject(UagUserControllerUseCasesBindings.v1.UseUagUserLinkUsr) private v1_UseUagUserLinkUsr: UseUagUserLinkUsr.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_0],
    resource: v1.uags.name.users.fk.del.resource,
    scopes: ['post'],
    voters: [AuthzBindings.Usr.GroupName],
  })
  @post(v1.uags.name.users.fk.path, {
    'x-controller-name': controller,
    description:
      '**[`root`|`group_0`]** : ' +
      'Link `Users.{fk}` to the `UserAccessGroup.{name}`. ' +
      "Only work if the current user `UAG`'s rank is higher than the target `UAG`.",
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
  async [v1.uags.name.users.fk.post.fn](
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
