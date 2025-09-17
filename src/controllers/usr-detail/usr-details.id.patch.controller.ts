import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { repository } from '@loopback/repository'
import { getModelSchemaRef, param, patch, requestBody } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository } from '../../repositories'
import { UsrDetailAuthorizerBindings, UsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class PatchUsrDetailsIdController {
  constructor(
    @repository(UserDetailRepository)
    public userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.owner_0, UserAccessLevel.name.rank_0],
    resource: 'v1.usr-details.id.patch',
    scopes: ['patch'],
    voters: [UsrDetailAuthorizerBindings.Owner, UsrDetailAuthorizerBindings.Rank],
  })
  @patch('/v1/usr-details/{id}', {
    'x-controller-name': UsrDetailController.controller,
    description: '[`root`|`owner`|`rank`] : Patch the `UserDetail` attributes',
    responses: {
      '204': {
        description: '[`string`] : `UserDetail` PATCH success',
        'application/text': {
          schema: { type: 'string' },
        },
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      description: '[`Partial<UserDetail>`] : attributes to be updated/patched',
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserDetail, {
            partial: true,
            exclude: ['id', 'userId'],
          }),
        },
      },
      required: true,
    })
    userDetail: UserDetail
  ): Promise<string> {
    await this.userDetailRepository.updateById(id, userDetail)
    return 'Update success'
  }
}
