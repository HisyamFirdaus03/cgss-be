import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { Filter, repository } from '@loopback/repository'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository } from '../../repositories'
import { UsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsrDetailsController {
  constructor(
    @repository(UserDetailRepository)
    public userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: 'v1.usr-details.get',
    scopes: ['get'],
    voters: [],
  })
  @get('/v1/usr-details', {
    'x-controller-name': UsrDetailController.controller,
    description: '[`root`] : Get `UserDetail` matching the `Filter<UserDetail>` clause',
    responses: {
      '200': {
        description: '[`UserDetail`] : Array of model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserDetail, { includeRelations: false }),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(UserDetail) filter?: Filter<UserDetail>): Promise<UserDetail[]> {
    return this.userDetailRepository.find(filter)
  }
}
