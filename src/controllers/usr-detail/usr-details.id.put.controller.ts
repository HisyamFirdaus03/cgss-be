import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { repository } from '@loopback/repository'
import { getModelSchemaRef, param, put, requestBody } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository } from '../../repositories'
import { UsrDetailAuthorizerBindings, UsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class PutUsrDetailsIdController {
  constructor(
    @repository(UserDetailRepository)
    public userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.owner_0, UserAccessLevel.name.rank_0],
    resource: 'v1.usr-details.count.get',
    scopes: ['get'],
    voters: [UsrDetailAuthorizerBindings.Owner, UsrDetailAuthorizerBindings.Rank],
  })
  @put('/v1/usr-details/{id}', {
    'x-controller-name': UsrDetailController.controller,
    description: '[`root`|`owner`|`rank`] : replace current `UserDetail` instance',
    responses: {
      '204': {
        description: '[`string`] : `UserDetail` replace success',
        'application/text': {
          schema: {
            type: 'string',
          },
        },
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody({
      description: '[`UserDetail`] : new instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserDetail, {
            exclude: ['id', 'userId'],
          }),
        },
      },
      required: true,
    })
    userDetail: UserDetail
  ): Promise<string> {
    const ori = await this.userDetailRepository.findById(id)
    userDetail.userId = ori.userId
    await this.userDetailRepository.replaceById(id, userDetail)
    return 'Update success'
  }
}
