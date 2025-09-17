import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { Count, CountSchema, Where } from '@loopback/repository'
import { getModelSchemaRef, param, patch, requestBody } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { User } from '../../models'
import { UserController, UserControllerUseCasesBindings, UseUserUpdate } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class PatchUsersController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserUpdate)
    protected v1_UseUserUpdate: UseUserUpdate.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: v1.users.update.patch.resource,
    scopes: ['patch'],
  })
  @patch(v1.users.update.path, {
    'x-controller-name': controller,
    description: '[`root`] : patch attributes for all users specified by the `where` filter.',
    responses: {
      '200': {
        description: '[`Count`] : User update success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async [v1.users.update.patch.fn](
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, { partial: true }),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>
  ): Promise<Count> {
    return this.v1_UseUserUpdate.call({
      user: user,
      where: where,
    })
  }
}
