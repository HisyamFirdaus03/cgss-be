import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { getModelSchemaRef, param, post, requestBody } from '@loopback/rest'
import {
  AuthzBindings,
  getModelSchemaObject,
  JwtStrategy,
  UserAccessLevel,
  UserWithUserDetail,
  UserWithUserDetailModel,
} from '../../common'
import { UserAccessGroup } from '../../models'
import { UagUserController, UagUserControllerUseCasesBindings, UseUagUserCreateUsr } from './module'

const { v1, controller } = UagUserController

@authenticate(JwtStrategy.UserAccessToken)
export class UagsIdUsersPostController {
  constructor(
    @inject(UagUserControllerUseCasesBindings.v1.UseUagUserCreateUsr)
    private v1_UseUagUserCreateUsr: UseUagUserCreateUsr.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.group_0],
    resource: v1.uags.id.users.get.resource,
    scopes: ['post'],
    voters: [AuthzBindings.Usr.GroupId],
  })
  @post(v1.uags.id.users.path, {
    'x-controller-name': controller,
    description:
      '**[`root`|`group_0`]** : ' +
      'Create a new `User` and link it to `UserAccessGroup`. Email verification link ' +
      'would be sent to the provided email address. ' +
      'Only works if the current user `UAG` rank is higher than the target `UAG`',
    responses: {
      '200': {
        description: '[`UserWithUserDetail`] : Newly created and linked `User`',
        content: {
          'application/json': {
            schema: getModelSchemaObject(UserWithUserDetail),
          },
        },
      },
    },
  })
  async [v1.uags.id.users.post.fn](
    @param.path.number('id', {
      description: '[`id`] : of `UserAccessGroup`',
    })
    id: typeof UserAccessGroup.prototype.id,
    @requestBody({
      description: '[`UserWithUserDetailModel`]: `User` model instance with ' + 'optional `UserDetail` instance',
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserWithUserDetailModel),
        },
      },
    })
    user: UserWithUserDetailModel
  ): Promise<UserWithUserDetail> {
    user.uagIdentifier = id!
    return this.v1_UseUagUserCreateUsr.call(user)
  }
}
