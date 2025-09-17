import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { Count, CountSchema, Where } from '@loopback/repository'
import { get, param } from '@loopback/rest'
import { JwtStrategy, UseCase, UserAccessLevel } from '../../common'
import { User } from '../../models'
import { UserController, UserControllerUseCasesBindings } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsersCountController {
  constructor(
    @inject(UserControllerUseCasesBindings.v1.UseUserCount) private v1_UseUserCount: UseCase<Where<User>, Count>
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.member],
    resource: v1.users.count.get.resource,
    scopes: ['get'],
  })
  @get(v1.users.count.path, {
    'x-controller-name': controller,
    description: '[`root`|`admin`|`member`] : Count number of `User` instances',
    responses: {
      '200': {
        description: '[`Count`] User model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async [v1.users.count.get.fn](@param.where(User, 'Where<User>') where?: Where<User>): Promise<Count> {
    return this.v1_UseUserCount.call(where ?? {})
  }
}
