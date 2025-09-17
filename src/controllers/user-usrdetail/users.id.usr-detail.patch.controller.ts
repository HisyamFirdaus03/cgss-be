import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { Count, CountSchema, repository, Where } from '@loopback/repository'
import { getModelSchemaRef, getWhereSchemaFor, param, patch, requestBody } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository, UserRepository } from '../../repositories'
import { UserUsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class PatchUsersIdUsrDetailController {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(UserDetailRepository)
    protected userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0, UserAccessLevel.name.owner_0],
    resource: 'v1.users.id.usr-detail.patch',
    scopes: ['patch'],
    voters: [AuthzBindings.Usr.Owner, AuthzBindings.Usr.Rank],
  })
  @patch('/v1/users/{id}/usr-detail', {
    'x-controller-name': UserUsrDetailController.controller,
    description: '[`root`|`owner`|`rank`] : Patch `UserDetail` instance',
    responses: {
      '200': {
        description: '[`Count`] : User.UserDetail PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async patch(
    @param.path.number('id', {
      description: '[`id`] : of the `User`',
    })
    id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserDetail, { partial: true }),
        },
      },
    })
    userDetail: Partial<UserDetail>,
    @param.query.object('where', getWhereSchemaFor(UserDetail)) where?: Where<UserDetail>
  ): Promise<Count> {
    return this.userRepository.userDetail(id).patch(userDetail, where)
  }
}
