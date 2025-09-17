import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { repository } from '@loopback/repository'
import { del, param } from '@loopback/rest'
import { JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetailRepository } from '../../repositories'
import { UsrDetailAuthorizerBindings, UsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class DelUsrDetailsIdController {
  constructor(
    @repository(UserDetailRepository)
    public userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.owner_0, UserAccessLevel.name.rank_0],
    resource: 'v1.usr-details.id.del',
    scopes: ['del'],
    voters: [UsrDetailAuthorizerBindings.Owner, UsrDetailAuthorizerBindings.Rank],
  })
  @del('/v1/usr-details/{id}', {
    'x-controller-name': UsrDetailController.controller,
    description: '[`root`|`owner`|`rank`] : Permanently delete `UserDetail` instance',
    responses: {
      '204': {
        description: '[`string`] : UserDetail DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<string> {
    await this.userDetailRepository.deleteById(id)
    return 'Success'
  }
}
