import { authenticate } from '@loopback/authentication'
import { authorize } from '@loopback/authorization'
import { Count, CountSchema, repository, Where } from '@loopback/repository'
import { del, getWhereSchemaFor, param } from '@loopback/rest'
import { AuthzBindings, JwtStrategy, UserAccessLevel } from '../../common'
import { UserDetail } from '../../models'
import { UserDetailRepository, UserRepository } from '../../repositories'
import { UserUsrDetailController } from './module'

@authenticate(JwtStrategy.UserAccessToken)
export class DelUsersIdUsrDetailController {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(UserDetailRepository)
    protected userDetailRepository: UserDetailRepository
  ) {}

  @authorize({
    allowedRoles: [UserAccessLevel.name.rank_0, UserAccessLevel.name.owner_0],
    resource: 'v1.users.id.usr-detail.del',
    scopes: ['del'],
    voters: [AuthzBindings.Usr.Owner, AuthzBindings.Usr.Rank],
  })
  @del('/v1/users/{id}/usr-detail', {
    'x-controller-name': UserUsrDetailController.controller,
    description: '[`root`|`owner`|`rank`] : Delete `UserDetail.{userId}` instance for `User.{id}`',
    responses: {
      '200': {
        description: '[`Count`] : User.UserDetail DELETE success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async delete(
    @param.path.number('id', {
      description: '[`id`] : of `User`',
    })
    id: number,
    @param.query.object('where', getWhereSchemaFor(UserDetail)) where?: Where<UserDetail>
  ): Promise<Count> {
    return this.userRepository.userDetail(id).delete(where)
  }
}
