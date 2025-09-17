import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { repository } from '@loopback/repository'
import { getModelSchemaRef, post, requestBody } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository } from '../../repositories'
import { UsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class PostUsrDetailsController {
  constructor(
    @repository(UserDetailRepository)
    public userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.none],
    resource: 'v1.usr-details.post',
    scopes: ['post'],
    voters: [],
  })
  @post('/v1/usr-details', {
    'x-controller-name': UsrDetailController.controller,
    description: '[`root`] : Create a new instance of `UserDetail`',
    responses: {
      '200': {
        description: '[`UserDetail`] : model instance',
        content: { 'application/json': { schema: getModelSchemaRef(UserDetail) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserDetail, {
            title: 'NewUserDetail',
            exclude: ['id'],
          }),
        },
      },
    })
    userDetail: Omit<UserDetail, 'id'>
  ): Promise<UserDetail> {
    return this.userDetailRepository.create(userDetail)
  }
}
