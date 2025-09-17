import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { FilterExcludingWhere, repository } from '@loopback/repository'
import { get, getModelSchemaRef, param } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository } from '../../repositories'
import { UsrDetailAuthorizerBindings, UsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsrDetailsIdController {
  constructor(
    @repository(UserDetailRepository)
    public userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.owner_0, UserAccessLevel.name.rank_0],
    resource: 'v1.usr-details.id.get',
    scopes: ['get'],
    voters: [UsrDetailAuthorizerBindings.Owner, UsrDetailAuthorizerBindings.Rank],
  })
  @get('/v1/usr-details/{id}', {
    'x-controller-name': UsrDetailController.controller,
    description:
      '[`root`|`owner`|`rank`] : Get `UserDetail` instance that matched ' +
      '`FilterExcludingWhere<UserDetail>` clause.',
    responses: {
      '200': {
        description: '[`UserDetail`] : model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserDetail),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id', {
      description: '[`id`] : of `UserDetail` instance',
    })
    id: number,
    @param.filter(UserDetail, { exclude: ['where', 'limit', 'skip', 'offset', 'order'] })
    filter?: FilterExcludingWhere<UserDetail>
  ): Promise<UserDetail> {
    return this.userDetailRepository.findById(id, filter)
  }
}
