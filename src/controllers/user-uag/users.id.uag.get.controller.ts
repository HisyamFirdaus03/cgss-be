import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { inject } from '@loopback/core'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserAccessGroup } from '../../models'
import { UserUagController } from './module'
import { UserUagControllerUseCasesBindings } from './module/usecases'
import { UseUserUagFind } from './module/usecases/providers'

const { v1, controller } = UserUagController

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsersIdUagController {
  constructor(
    @inject(UserUagControllerUseCasesBindings.v1.UseUserUagFind)
    protected v1_UseUserUagFind: UseUserUagFind.v1
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.adminSystem, UserAccessLevel.name.member],
    resource: v1.users.id.uag.get.resource,
    scopes: ['get'],
    voters: [],
  })
  @get(v1.users.id.uag.path, {
    'x-controller-name': controller,
    description: '[`root`|`admin`|`member`] : Get list of linked `UserAccessGroup` to `User`',
    responses: {
      '200': {
        description: '[`UserAccesGroup[]`] : list of linked `UserAccessGroup` to `User`',
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
  async [v1.users.id.uag.get.fn](
    @param.path.number('id', {
      description: '[`id`] : of `User` to be queried',
    })
    id: number
  ): Promise<UserAccessGroup[]> {
    return this.v1_UseUserUagFind.call(id!)
  }
}
