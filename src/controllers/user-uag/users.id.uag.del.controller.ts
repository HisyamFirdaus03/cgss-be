import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { del, getModelSchemaRef, param } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { User, UserAccessGroup } from '../../models'
import { UserUagController, UserUagControllerUseCasesBindings, UseUserUagUnlinkAllByUagName } from './module'

const { v1, controller } = UserUagController

@authenticate(JwtStrategy.UserAccessToken)
export class DelUsersIdUagController {
  constructor(
    @inject(UserUagControllerUseCasesBindings.v1.UseUserUagUnlinkAllByUagName)
    protected v1_UseUserUagUnlinkAllByUagName: UseUserUagUnlinkAllByUagName.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: v1.users.id.uag.del.resource,
    scopes: ['del'],
    voters: [],
  })
  @del(v1.users.id.uag.path, {
    'x-controller-name': controller,
    description:
      '[`root`] : Unlink `User` from all `UserAccessGroup` ' + '(This operation do not delete the user instance)',
    responses: {
      '200': {
        description: '[`UserAccessGroup[]`] : List of linked `UserAccessGroup` to `User`',
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
  async [v1.users.id.uag.del.fn](
    @param.path.number('id', {
      description: '[`id`] : of `User` to be unlinked from all `UserAccessGroup`',
    })
    id: typeof User.prototype.id
  ): Promise<UserAccessGroup[]> {
    return this.v1_UseUserUagUnlinkAllByUagName.call(id!)
  }
}
