import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { Filter } from '@loopback/repository'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel, UserWithUagAndUserDetailPagedUser } from '../../common'
import { User } from '../../models'
import { UserController, UserControllerUseCasesBindings, UseUserFind } from './module'

const { v1, controller } = UserController

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsersController {
  constructor(@inject(UserControllerUseCasesBindings.v1.UseUserFind) private v1_UseUserFind: UseUserFind.v1) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: v1.users.find.get.resource,
    scopes: ['get'],
  })
  @get(v1.users.find.path, {
    'x-controller-name': controller,
    description: '[`root`] : Find `User` instances with optional relations',
    responses: {
      '200': {
        description: '[`User[]`] : Array of `User` model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserWithUagAndUserDetailPagedUser),
          },
        },
      },
    },
  })
  async [v1.users.find.get.fn](@param.filter(User) filter?: Filter<User>): Promise<UserWithUagAndUserDetailPagedUser> {
    return this.v1_UseUserFind.call(filter)
  }
}
