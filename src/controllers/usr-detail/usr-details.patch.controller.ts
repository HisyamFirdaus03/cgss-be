import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { Count, CountSchema, repository, Where } from '@loopback/repository'
import { getModelSchemaRef, param, patch, requestBody } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository } from '../../repositories'
import { UsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class PatchUsrDetailsController {
  constructor(
    @repository(UserDetailRepository)
    public userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: 'v1.usr-details.patch',
    scopes: ['patch'],
    voters: [],
  })
  @patch('/v1/usr-details', {
    'x-controller-name': UsrDetailController.controller,
    description: '[`root`] : Update `UserDetail` attributes for `User`s ' + 'matching the `Where<UserDetail>` clause',
    responses: {
      '200': {
        description: '[`Count`] : UserDetail PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      description: '[`Partial<UserDetail>`] : model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserDetail, { partial: true }),
        },
      },
    })
    userDetail: UserDetail,
    @param.where(UserDetail) where?: Where<UserDetail>
  ): Promise<Count> {
    return this.userDetailRepository.updateAll(userDetail, where)
  }
}
