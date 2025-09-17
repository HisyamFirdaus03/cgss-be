import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { Count, CountSchema, repository, Where } from '@loopback/repository'
import { get, param } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository } from '../../repositories'
import { UsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class GetUsrDetailsCountController {
  constructor(
    @repository(UserDetailRepository)
    public userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: 'v1.usr-details.count.get',
    scopes: ['get'],
    voters: [],
  })
  @get('/v1/usr-details/count', {
    'x-controller-name': UsrDetailController.controller,
    description: '[`root`] : Get `Count` of `UserDetail`',
    responses: {
      '200': {
        description: '[`Count`] : UserDetail model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(@param.where(UserDetail) where?: Where<UserDetail>): Promise<Count> {
    return this.userDetailRepository.count(where)
  }
}
