import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { del, getModelSchemaRef, param } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel, UserWithUagAndUserDetail } from '../../common'
import { UserController, UserControllerUseCasesBindings, UseUserDeleteById } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class Users_Id_DeleteController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserDeleteById) private v1_UseUserDeleteById: UseUserDeleteById.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: v1.users.id.del.resource,
    scopes: ['delete'],
  })
  @del(v1.users.id.path, {
    'x-controller-name': controller,
    description: '[`root`]:Permanently delete the user (warning: can not recover upon ' + 'successful operation)',
    responses: {
      '204': {
        description: '[`UserWithUserDetail`] : User hard delete status message',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithUagAndUserDetail),
          },
        },
      },
    },
  })
  async [v1.users.id.del.fn](
    @param.path.number('id', {
      description: "[`id`] :  of `User`'s instance",
      required: true,
    })
    id: number
  ): Promise<UserWithUagAndUserDetail> {
    return this.v1_UseUserDeleteById.call(id)
  }
}
